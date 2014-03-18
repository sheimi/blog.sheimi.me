---
layout: post
title: Operating System Review (1)
category: note
published: true
home: no
meta:
  location: UCSD
tags: [os, paper, review, note]
---

### Rio File Cache (Note)

* [The Rio File Cache: Surviving Operating System Crashes](http://portal.acm.org/ft_gateway.cfm?id=237154&type=pdf&coll=Portal&dl=GUIDE&CFID=12705301&CFTOKEN=27549233)
* Use UPS like method to make memory safe (persistent)
* Goal: to achieve the performance of main memory with the reliability of disk:
  write-back performance with write-through reliability of disk

### File cache

* Goal: Enable file in memory to survive crashes
* Based on Digital Unix V3.0
  - Will store file data in two distinct buffers in memory
    + Directories, symbolic links, inodes and super blocks -> traditional Unix
      buffer cache
    + Regular files are stored in the *Unified Buffer Cache*
  - UBC will not use virtual adress space (using physical)
  - VM and UBC dynamically trade off

#### Enable the file cache to survive a crash (Protection)

* ensure the  system does not accidentally overwrite the file cache while
  crashing
* main issue is how to control accesses to the file cache (there is no DD)
* use tech like sanboxing and vm
* however, some kernel accesses will bypass vm protection

##### Two different method to protect

* disable the ability of processor to bypass TLB (current)
* code patching: prevent physical addresses from bypassing TLB
  - modified the kernel object code by inserting a check before every kenerl
    store (write), and make sure it is not in the file cache or it is writable
  - 20% - 50% slower.
  - use only when the process cannot be configured to mapp all address through
    TLB
  - mmap, modified to map the file read only
* only protect memory from kernel crashes

#### Warm Reboot

* when system is rebooted, it must read the file cache contents that presented
  in physical memory before the crash and update fs with this data
* Design priority: ease of implemetnation > reboot speed
* Two issues:
  - what additional data the system maintains during normal operation
    + make it easier to find, identify, and restore
    + keep and protect a separate area of memory (registry)
    + registry contains physical address, file id, offset and size
    + 40byte for 8KB
  - when to restore the (dirty) file cache content (two step)
    + dumpphysical memory to swap partition, restore the metadata to disk
    + user-level process analyze the memory dump and restores the UBC

#### Effects on File System Design

* reliability-induced writes to disk are no longer needed
* metadata updates in buffer cache must carefully ordered
* high throughput makes it feasible to guarantee atomicity when updating critial
  metadata information

### Reliability

* Key: files in memory should be made as safe from system crashes as files on disk
* inject faults to crash the running system, reboot and examine the file data
* fault model: fault types injected (not so important to me)
* detect corruption
  - checksum (direct corruption)
  - memTest (direct and indirect corrupton)

### Architectural Support

* force all access to TLB (or use code patching)
* memory with power (UPS)
