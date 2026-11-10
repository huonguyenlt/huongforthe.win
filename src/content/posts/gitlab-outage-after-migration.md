---
title: "GitLab Outage After a Successful Migration"
pubDatetime: 2026-11-09T00:00:00+07:00
description: >-
  Troubleshooting a GitLab outage after a migration: PostgreSQL Patroni replica
  recovery, a full filesystem, and an unresolved cause of WAL accumulation.
draft: false
tags:
  - devops
  - gitlab
---

## What happened?

Over the weekend, we migrated our GitLab 2K hybrid architecture to a 3K cluster. Everything went smoothly, and all post-migration checks passed.

However, on Monday morning, when I started working and tried to access GitLab, I couldn't reach the application. The web page returned a **500 Internal Server Error**.

I started investigating the issue myself.

## Initial investigation

Here are the steps I took during the initial troubleshooting:

1. **Checked the GitLab Webservice pods.**

   I checked the logs of the `gitlab-webservice` pods and found errors indicating that they could not connect to the database server.

2. **Tested network connectivity to the database.**

   I tested the connection from a worker node to the database server. The connection worked, so there didn't appear to be a network connectivity issue.

3. **Restarted the Webservice pods.**

   I tried restarting all Webservice pods, but the issue persisted.

4. **Checked the PostgreSQL cluster status.**

   Finally, I checked the status of the PostgreSQL Patroni cluster using:

   ```sh
   gitlab-ctl patroni members
   ```

The output revealed that only the leader was running normally. One replica was still starting, while another replica had disappeared from the cluster.
At this point, I wasn't sure what to investigate next, so I opened a support ticket with the GitLab Support team.

## Root cause investigation

After further investigation, we identified the following problems:

- The replica that was still starting required WAL (Write-Ahead Log) files that were no longer available.
- The other replica had disappeared because its root filesystem was 100% full.

The disk space issue was caused by the accumulation of WAL files in the following directory:

```text
/var/opt/gitlab/postgresql/data/pg_wal
```

We still didn't know why so many WAL files had accumulated in the first place. That part of the investigation remained unresolved.

## Recovery steps

After identifying the problems, we proceeded with the recovery.

**Step 1: Reinitialize the first replica**

We reinitialized the first replica using the following command:

```sh
gitlab-ctl patroni reinitialize-replica
```

The command completed, and the replica came back up.

**Step 2: Free up disk space and restart the second replica**

Next, we stopped the GitLab processes on the second replica and freed up disk space by removing the unnecessary files that were consuming storage.

**Step 3: Reconfigure and start GitLab**

We then ran:

```sh
gitlab-ctl reconfigure
gitlab-ctl start
```

The replica initialized successfully.

Finally, we checked the Patroni cluster status again. This time, the output showed that one leader and two replicas were running normally.

## Service restored

After resolving the database issue, the GitLab Service pods became healthy again, and the website was accessible.

The incident was resolved, and GitLab was back online.

## Takeaways

Although the migration had passed all post-migration checks, this incident reminded me that a successful migration does not necessarily mean the system is completely free of operational issues.

There are still a few things I want to investigate further, especially why WAL files accumulated to the point of filling up the filesystem.

Understanding the underlying cause is just as important as restoring the service. Otherwise, the same problem could happen again.
