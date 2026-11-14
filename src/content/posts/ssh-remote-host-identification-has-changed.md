---
title: "SSH: REMOTE HOST IDENTIFICATION HAS CHANGED! – What Does It Mean and How to Fix It?"
pubDatetime: 2026-11-15T00:00:00+07:00
description: >-
  Learn what “REMOTE HOST IDENTIFICATION HAS CHANGED” means in SSH, why host
  key mismatches happen after server migration or reinstallation, and how to
  verify the correct fingerprint before accepting the new host key.
draft: false
tags:
  - ssh
  - security
  - git
  - devops
---

![SSH warning](/images/ssh-warning.svg)

Have you ever received the warning shown above when trying to SSH into a server, or simply when pulling or pushing code to/from a remote Git server (GitHub, GitLab)?

Well, at first, I thought this was a well-known warning and that anyone who works in IT had encountered it at least once in their life. It wasn't until I upgraded my company's GitLab cluster from a 2K to a 3K architecture that I realized I was wrong.

After switching GitLab to a 3K architecture, I received numerous incident reports from developers who could no longer pull or push code to GitLab because of this warning. Some even panicked when they saw the phrase "man-in-the-middle attack."

So, if your heart still skips a beat when you see this warning, this post is for you. I will explain why you get this warning and how to address it.

## Why does this happen?

When you use the SSH protocol to connect to a server, SSH performs a host authentication process. It stores the remote server's public host key in `~/.ssh/known_hosts`. On subsequent connections, SSH compares the server's presented key against the stored key. If they don't match, you get this warning.

What can cause the keys to mismatch, you might ask? Well, there are several things, either on your side or someone else's, that can lead to this warning.

First, you might reinstall the server's OS, which will generate new host keys. Or you might recreate the server and reuse its IP address. In these cases, the key mismatch is expected, so it is not necessarily a security risk.

Second, the domain or IP address might be mapped to another server. This could happen if someone redirects the existing domain or IP address to their own server without your knowledge. And that's the risk SSH is trying to protect you against.

## How to fix it?

Fixing this warning is simple. But before explaining how to fix it, I want to make one thing clear: this is a warning, not necessarily an error. When SSH detects a host key mismatch, it wants you to double-check the identity of the server you're connecting to.

If you're aware of a recent change to the server, here are two ways to remove the old host key entry.

### Method 1: Using ssh-keygen (Recommended)

The recommended way is to use the `ssh-keygen -R` command to remove the old host key entry from your `known_hosts` file.

For example:

```bash
ssh-keygen -R gitlab.example.com
```

This command finds and removes the entries associated with the specified hostname from the `known_hosts` file. Unlike deleting the entire file, this approach preserves the host keys of other servers you have previously connected to.

If you're connecting using an IP address instead of a hostname, you can use the IP address:

```bash
ssh-keygen -R 192.168.1.100
```

### Method 2: Manually editing known_hosts

Alternatively, you can manually find the specific entry in the `known_hosts` file and remove that line. The affected entry is usually identified in the warning message.

## Verify the new host key

After removing the old host key, try connecting to the server again:

```bash
ssh git@gitlab.example.com
```

SSH will prompt you to verify the new host key:

```text
The authenticity of host 'gitlab.example.com' can't be established.
ED25519 key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.

Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Before accepting the new host key, you should verify its fingerprint.

To do that, obtain the server's public host key fingerprint directly from the server through a trusted channel. If you have access to the server, run:

```bash
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

You will get output similar to this:

```text
256 SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx root@hostname (ED25519)
```

Compare the fingerprint returned by this command with the one displayed by your SSH client. They must match.

If they match, you can type `yes` to accept the new host key. SSH will then store the new host key in your `known_hosts` file, and subsequent connections should work without displaying the warning.

If the fingerprints don't match, do not accept the new host key. Investigate the mismatch before proceeding.

## Conclusion

The `REMOTE HOST IDENTIFICATION HAS CHANGED!` warning doesn't necessarily mean you're under a man-in-the-middle attack. It simply means that the host key presented by the server is different from the one SSH previously stored.

However, you should never blindly remove the old key and accept the new one without verifying its fingerprint. A legitimate server migration or OS reinstallation can cause this warning, but an unauthorized change to the server's identity can also trigger it.

Understand what causes the warning, verify the new host key, and then you can safely get back to your work.
