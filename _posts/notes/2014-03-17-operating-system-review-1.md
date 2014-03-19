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

Soft Updates (Note)
-------------------

* [Soft Updates: A Solution to the Metadata Update Problem in File Systems](http://www.ece.cmu.edu/~ganger/papers/softupdates.pdf)
* An implementation technique for low-cost sequencing of find-grained updates to
  write-back cache blocks.
* Improve performance on metadata updates 
* Achieve memory-based file system performance, stronger integrity and security
  guarantees than disk-based file systems.
* Metadata: directories, indoes, and free block maps
* Must maintain the integrity of the metadata
  - crash: loss a lot of data
  - no dangling pointers to uninitialized space
  - no ambiguous res ownership tcaused by multiple pointers
  - no live resources to which there are no pointers
* Disparity between processing performance and disk access time
  - increasing main memory size
  - aggressively employ caching techniques to reduce disk latencies
* write-back caching for metadata
  - strong spatial and temporal locality 
  - sammll relative to the units of disk access
  - write through and write back(write-behind) (from wikipedia)
    + write is done synchronously both to the cache and to the backing store
    + initially, writing is done only to the cache. The write to the backing
      store is postponed until the cache blocks containing the data are about to
      be modified/replaced by new content
* Soft updates tracks dependencies on a per-pointer basis and allow block to be
  written in any order

### Metadata udpate problem

* the modifications must be propagated to stable storage in a specific order
* update dependency, three rules
  - never point to a structure before it has been initialized
  - never reuse a reource before nullifying all previous pointers to it
  - never reset the last pointer to a live resource before a new pointer has
    been set

#### Previous Solutions

* Synchronous Writes
  - performance degradation
  - or ignore some update, and will lead to reducing integrity, security, and
    availability
* Nonvolatile RAM (NVRAM)
  - need additional devices
  - incur additonal overheads for moving data to and from them
* Atomic Updates: group each set of dependent updates as an atomic operation
  - write-ahead logging or shadow paging
* Scheduler-Enforced Ordering
  - delay writes can't safely be used
  - drivers must support the modified inerface and the corresponding sequencing
    rules
* Interbuffer Dependencies
  - only a marginal reduction in the number of synchronous write
  - circular dependency arise in the normal course of file system operation

#### Ideal Solution

* immediate stability and consistency of all metadata update with no restriction
  on on-disk data organization
* no performnce overhead
* no special hardware support
* *no such solution*
* should choose some of them
  - consistency
  - no special hardware support
* in some environment, compromise immediate stability and live with a small
  window of valnerability for new data in order to achieve *higher performance*
* the characteristics are:
  - Applications should never wait for disk writes unless they explicitly choose
    to do so
  - The system should propagate modifed metadata to disk using minimum possible
    number of disk writes (an allowed window of vulnerability) (aggressive
    write-back caching)
  - minimize the amount of main memory needed to cache dirty metadata and
    related auxiliary information
  - the cache write-back code and the disk request scheduler should not be
    constrained in choosing what blocks to write to disk

### Soft Updates

* combining multiple metadata updates into a much smaller quantity of background
  disk writes
* maintain dependency information, associated with any dirty in-memory copies of
  metadata (keep track of sequencing requirements)
  - dependency update with the update of metadata
  - will be consulted when flushed to disk
* Use dynamically managed DAG
  - difficulty: cyclic dependencies and aging problems
* Dependency information is maintained at a very find granularity
  - per field or pointer
* undo/redo appropriate
* during disk write, the block is locked to prevent applications from seeing
  the rolled-back state (Fig 2)

#### Soft Updates on 4.4BSD FFS

* sync and async are replaced by delay writes (except using fsync or O\_SYNC)
* For main structure require sequenced metadata updates
  + block allocation
    - block init ==> block pointer written
    - if the free space map from which the block or fragment is allocated must
      be written to disk before the new pointer
    - these two are enforced by undo / redo on the block pointer and file size
  + block deallocation
    - previous on-disk pointer be reset ==> disk block can be reused
  + link addition
    - update dir inode ==> new dir entry point to inode
    - if the inode is new and the ondisk free maps are being protected, the free
      inode map written to disk ==> new pointer point to it
    - enforced by undo / redo
  + link removal
    - dir entry's inode pointer nullify ==> inode's link count decrease

#### File System Recovery
  
* extend the set of protected updates to guarantee the on-disk metadata can
  always be used safely
* some minor inconsistencies:
  - unused blocks may not appear in the free space maps
  - unreferenced inodes may not appear in the free inode maps
  - Inode link counts may exceed the actual number of associated directory
    entires
* use *fsck* to reclaim unreferenced resources and correct link counts



Rio File Cache (Note)
--------------------

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
