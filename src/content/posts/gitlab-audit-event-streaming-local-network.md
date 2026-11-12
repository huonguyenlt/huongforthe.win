---
title: "Troubleshooting GitLab Audit Event Streaming"
pubDatetime: 2026-11-12T00:00:00+07:00
description: >-
  Troubleshooting GitLab audit event streaming when sending logs to destination server inside local networks
draft: false
featured: true
tags:
  - devops
  - gitlab
  - work
---

I tried to set up GitLab Audit Event Streaming to send audit logs to an external target server through an HTTP endpoint on port 80. The endpoint was added successfully, but the destination server couldn't receive any logs.

## Troubleshooting steps

First, I checked whether the destination server allowed traffic on port 80. It did allow HTTP traffic.

```sh
sudo firewall-cmd --list-all
```

Relevant output:

```text
public (active)
  target: default
  services: cockpit dhcpv6-client http ssh
  ports:
  protocols:
  forward: yes
  masquerade: no
```

Second, I checked whether the source server could reach the target server on port 80. It could.

```sh
nc -zv <TARGET_SERVER_IP> 80
```

Output:

```text
Ncat: Version 7.92
Ncat: Connected to <TARGET_SERVER_IP>:80.
Ncat: 0 bytes sent, 0 bytes received in 0.01 seconds.
```

Third, I used `tcpdump` on both servers to check whether any packets were being sent by the Gitlab server to or received by the target server. On the target server, I did not see any incoming packets on port 80.

Command:

```sh
sudo tcpdump -i any -nn -vvv -A 'dst port 80'
```

I also checked the source server for outgoing packets destined for the target server, but I did not see any either.

Command:

```sh
sudo tcpdump -i any -nn -vvv -XX \
  'dst host <TARGET_SERVER_IP> and dst port 80'
```

This indicated that no audit events were being sent out.

Fourth, I tried sending a POST request manually from the GitLab server to the destination log server. This time, the destination server could receive the request.

```sh
curl -v -X POST http://<TARGET_SERVER_IP>:80/ \
  -H 'Content-Type: application/json' \
  -d '{"message":"tcpdump connectivity test"}'
```

The destination server returned `HTTP/1.1 200 OK`.

I also checked the incoming packets on the destination server using `tcpdump`:

```sh
sudo tcpdump -nn -tttt -i any \
  'src host <SOURCE_SERVER_IP> and tcp dst port 80'
```

This time, I could see the incoming packets from the HTTP POST request.

This confirmed that the network connection was working and the destination server could receive HTTP POST requests. The problem was coming from GitLab itself.

## Root cause

Finally, it was time to dive into the GitLab logs.

I found a GitLab Rails exception in:

```text
/var/log/gitlab/gitlab-rails/exceptions_json.log
```

The relevant exception was:

```json
{
  "meta.caller_id": "AuditEvents::AuditEventStreamingWorker",
  "exception.class": "Gitlab::HTTP_V2::BlockedUrlError",
  "exception.message": "URL is blocked: Requests to the local network are not allowed",
  "exception.cause_class": "Gitlab::HTTP_V2::UrlBlocker::BlockedUrlError"
}
```

The exception revealed the actual problem: GitLab was blocking outbound HTTP requests to private network addresses.

After researching the issue, I discovered that GitLab restricts requests to local networks by default as a security measure.

## Resolution

The relevant GitLab setting is:

**Allow requests to the local network from webhooks and integrations**

This setting controls whether GitLab can send requests to private network addresses through supported integrations.

After enabling this option, GitLab successfully established connections to the destination server, and the audit logs started arriving.
