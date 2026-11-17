---
title: "When Git Repositories Eat Up Your Gitaly Storage: A Git LFS Migration Story"
pubDatetime: 2026-11-17T00:00:00+07:00
description: >-
  Investigating high GitLab Gitaly repository storage, migrating large files to
  Git LFS, and reclaiming space from unreachable Git objects.
draft: false
tags:
  - devops
  - gitlab
  - git
  - work
---

Today, I ran into an interesting issue with our GitLab infrastructure. A team had migrated a large number of repositories containing large files into GitLab, causing disk usage in our Gitaly cluster to grow significantly.

I had to identify which team and repositories were responsible, figure out where the storage was being consumed, and then find a way to reduce repository size without losing any files.

Here is how I investigated and resolved the issue.

## Finding the source of the problem

My first step was to identify which groups were consuming the most storage.

I went to the GitLab Admin Area and sorted groups by storage usage. This helped narrow the investigation to groups with unusually high storage consumption.

However, GitLab project storage consists of several components: Repository, LFS, Build artifacts, Pipeline artifacts, etc.

Looking at total storage usage alone wasn't enough to identify the problem. I examined individual projects and compared their storage breakdowns to determine which component was responsible for the excessive usage.

Eventually, I found several repositories with unusually high repository storage but almost no storage in the other components, especially LFS. This was a strong indication that large files had been committed directly into Git history instead of being managed by Git LFS.

## Migrating large files to Git LFS

Git LFS (Large File Storage) is an extension that allows Git to manage large binary files more efficiently. Instead of storing the entire file content directly in the Git repository, Git stores a small pointer file that references the actual content stored separately in LFS storage.

Git LFS provides the `migrate` command to convert existing Git history. For example, I used the following commands to migrate selected file types or files under a specific directory:

```sh
git lfs migrate import --everything --include="*.zip,*.iso,*.mp4"
git lfs migrate import --everything --include="assets/**"
```

The `--include` option lets me specify which files to migrate.

**This operation rewrites Git history.** When large files are replaced with LFS pointer files, the Git trees and commit IDs change. After reviewing the rewritten refs and coordinating a quiet window, I force-pushed the branches and tags to GitLab:

```sh
# Force-push all branches
git push --force --all origin

# Force-push all tags
git push --force --tags origin
```

- `--force --all` updates all branch refs pushed by this command.
- `--force --tags` pushes tags and permits updating existing tag refs.

## Cleaning up old repository data

After successfully migrating the files and force-pushing the rewritten history, I still needed to reclaim disk space. I used GitLab's built-in repository housekeeping mechanism. 

1. Navigate to **Settings → General → Advanced** in the affected project.
2. Select **Run housekeeping**.
3. Wait at least 30 minutes.
4. Return to the same page.
5. Select **Prune unreachable objects**.

## Preventing this from happening again

Fixing the affected repositories solved the immediate problem, but I didn't want to repeat the same investigation in the future.

As a preventive measure, I configured GitLab's **Maximum push size (MiB)** setting under **Admin Area → Settings → General → Account and limit**. This helps prevent developers from accidentally pushing excessively large amounts of data into Git repositories.
