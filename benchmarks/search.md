# Search benchmark: plain object + walk vs dt-object

Question: with large data, is a dt-object better for searching than the same data as a plain JS object searched with `@peter.naydenov/walk`? The aim is to understand the cost and the gain, not to prove that one is better.

Measured on October 16, 2026 with dt-toolbox 8.1.3 (walk 7.0.1). Your numbers will differ with hardware, Node version and data shape.



## Method

One data set in two forms: a plain object (`JSON.parse` result) and a dt-object made from it. Records look like this, `N` of them:

```js
{ id, name, active,
  profile : { age, city, address: { zip, geo: [ x, y ] } },
  roles   : [ 'r1', 'r2' ],
  orders  : [ { id, total, items: [ 'p0' ] }, ... ]   // 0-3 orders
}
```

Each task is solved in up to three ways:

| Implementation | Meaning |
|---|---|
| `plain` | Hand-written JS that knows the data shape: direct access, `map`, `filter`, loops. This is the lower limit. |
| `walk` | `walk` with `copy:false` (no result built) and unused paths and cycle detection off. Generic: visits everything it doesn't skip. |
| `walk pruned` | `walk` with `IGNORE()` on branches that can't contain the answer. Uses the same knowledge as the dt version next to it. |
| `dt ...` | dt-toolbox store methods on a ready dt-object (`index`, `find`, `look`, `use`, `from`, drafts). |

Before timing, the script checks that every implementation returns the same result as `plain`. The times are for repeated queries on the same dt-object: `find` on all dt-lines uses its index by name from the second call on, so a single `find` costs a scan of all dt-lines (about 3 ms on 180k dt-lines). Every size runs in 3 separate Node processes with a different implementation order. A table cell is the median of the 3 processes; in each process it is the median of 15 calls after 3 warm-up calls.

**Break-even**: a dt-object costs time to create. The column shows how many queries a dt version needs before its faster queries pay back the conversion (`JSON.parse + dtbox.init` minus `JSON.parse`), compared with the fastest walk version of the same task. `never` means the dt query is not faster.



## Summary

**What the dt-object costs**

- Creating it takes about 10× as long as `JSON.parse` of the same data (20k records: 19 ms parse, +235 ms for `dtbox.init`). Loading a saved DT-model (`dtbox.load`) is 35-40% faster than `init`, but its JSON text is 3.7× larger.
- It keeps about 7× the heap of the plain object (20k records: 9.6 MiB vs 68.9 MiB). Every dt-line stores its name, its full path, and the paths of its children, and there is an index object with one entry per dt-line. The index by name for `find` adds about 5% when it is built.

**What it gives**

- **Lookup by path is O(1).** `dt.index ( 'root/users/15000/profile/address/zip' )` and `store.get` take about 1 µs at any size, because the dt-object keeps an index by breadcrumbs. A generic walk must visit every sibling on the way (2.4 ms at 20k, 19 ms at 100k). Plain `obj.users[15000].profile.address.zip` is still about 7× faster than `dt.index`, but you must write the path in code; `dt.index` takes it as a string.
- **Search by object name is 3-35× faster than walk.** `find ( 'address' )` takes the dt-lines from its index by name, and `look` runs only over them. Walk has to step through every object and value on the way. The gain is smaller on the largest data (3-17× at 100k), where `look` over 100k matches and garbage collection take most of the time.
- **A full scan is 1.7-2.7× faster than walk.** `look` loops over flat arrays. Walk recurses and prepares callback arguments for every value.
- **Custom filters** are 1.5-3.1× faster than a pruned walk. The selection is done once (`setupFilter`, about 9 ms at 20k) and then reused, so this pays off when the same selection is used many times.

**Where it doesn't help**

- **Plain JS that knows the shape wins every task.** The dt versions are 3-85× slower than it. dt-toolbox and walk both pay for being generic: a callback per value, and searching for something that direct code just reads.
- **Conditions across levels** (`active` on the user, `age` on its profile) are 1.4-4.5× slower than walk. A dt-line only has its own primitive values, so the query must jump to the parent with `dt.index`. Walk sees the whole record in one callback and can skip its content with `IGNORE()`.
- **Extracting a subtree** has no direct method; rebuilding it from `from()` with drafts is about 3× slower than walk's copy (all in µs, so it rarely matters).
- **`look` over all lines** with a key test is at best 2× faster than a pruned walk, and 1.6-2.5× slower in the aggregate test. The dt advantage comes from narrowing the scan-list first (`find`, `use`, `from`, `get`).

**Break-even**

When dt is faster per query, the conversion is paid back after roughly **12-110 queries** on the same dt-object, in this data. With custom filters it's around 60-190 queries. For one or a few searches over data you already have as an object, converting to a dt-object is slower overall.

**In short**: a dt-object is an index. It costs about 10× parse time and 7× memory to build, and pays off when the same data gets many queries, especially lookups by path and by object name. For a single pass over the data, walk (or plain code) is the better choice.



## Changes in 8.1.3

This benchmark showed where the store methods spent their time. 8.1.3 changes three of them, without changing their results:

- `store.get` uses the index by breadcrumbs instead of checking every dt-line.
- `store.find` on all dt-lines builds an index by name on its second call.
- `store.look` uses plain loops instead of `every` and `Object.entries`.

Same machine, 20k records, back-to-back runs of this benchmark:

| Task | Implementation | 8.1.2 | 8.1.3 | Change |
|---|---|---:|---:|---:|
| Collect a key anywhere | dt look all | 14.9 ms | 7.08 ms | **-52%** |
| Collect a key anywhere | dt find+look | 3.97 ms | 1.57 ms | **-60%** |
| Objects by name | dt find+look | 3.43 ms | 1.01 ms | **-71%** |
| Filter records | dt find+index | 4.14 ms | 1.83 ms | **-56%** |
| First match, early exit | dt find+look | 2.03 ms | 0.60 ms | **-70%** |
| First match, early exit | dt look all | 10.9 ms | 5.24 ms | **-52%** |
| Aggregate | dt look all | 12.6 ms | 7.51 ms | **-40%** |
| Aggregate | dt custom filter | 3.55 ms | 1.62 ms | **-54%** |
| Full scan | dt look all | 15.0 ms | 7.21 ms | **-52%** |

`store.get ( path )` on its own: 0.37 ms → 0.001 ms on 120k dt-lines. `init`, `load` and memory are unchanged.



## Results

Node v26.11.1, Apple M3 Max, darwin arm64. Median of 3 processes; in each process the median of 15 calls after 3 warm-up calls.


### 2,000 users (18,003 dt-lines)

#### Preparation

| Step | Time |
|---|---:|
| JSON.parse (std text) | 1.59 ms |
| dtbox.init (object in memory) | 14.9 ms |
| JSON.parse + dtbox.init | 17.7 ms |
| JSON.parse (DT-model text) + dtbox.load | 11.1 ms |
| dt.setupFilter ('orderItems'), once | 0.81 ms |

| Size | Value |
|---|---:|
| std JSON text | 0.4 MiB |
| DT-model JSON text | 1.5 MiB |
| heap kept by plain object | 0.9 MiB |
| heap kept by dt-object | 6.5 MiB |
| heap kept by dt-object + 'orderItems' filter | 6.4 MiB |

#### Search

Break-even: how many queries the dt version needs before the conversion (JSON.parse + dtbox.init minus JSON.parse = 16.2 ms) is paid back by faster queries, compared with the fastest walk version of the same task. `never` means the dt query itself is not faster.

| Task | Implementation | Time | vs plain | vs best walk | Break-even vs best walk |
|---|---|---:|---:|---:|---:|
| Point read by path<br><sub>users/1500/profile/address/zip</sub> | plain | 0.1 µs |  | 2616.0× faster |  |
|  | walk | 0.33 ms | 2616.0× slower |  |  |
|  | dt index | 0.8 µs | 6.7× slower | 392.6× faster | 50 |
| Collect a key anywhere<br><sub>all 'city' values (2000)</sub> | plain | 0.01 ms |  | 106.9× faster |  |
|  | walk | 1.88 ms | 147.1× slower |  |  |
|  | walk pruned | 1.37 ms | 106.9× slower |  |  |
|  | dt look all | 1.04 ms | 81.1× slower | 1.3× faster | 49 |
|  | dt find+look | 0.11 ms | 8.9× slower | 12.0× faster | 13 |
| Objects by name<br><sub>zip of every 'address' object (2000)</sub> | plain | 0.01 ms |  | 112.1× faster |  |
|  | walk | 1.55 ms | 112.1× slower |  |  |
|  | dt find+look | 0.12 ms | 8.8× slower | 12.8× faster | 12 |
| Filter records<br><sub>ids of active users with age >= 80</sub> | plain | 0.01 ms |  | 7.0× faster |  |
|  | walk | 0.09 ms | 7.0× slower |  |  |
|  | dt find+index | 0.13 ms | 10.0× slower | 1.4× slower | never |
| First match, early exit<br><sub>path of zip '11000' (record in the middle)</sub> | plain | 8.2 µs |  | 180.1× faster |  |
|  | walk | 1.48 ms | 180.1× slower |  |  |
|  | dt find+look | 0.06 ms | 7.9× slower | 22.8× faster | 12 |
|  | dt look all | 0.65 ms | 79.7× slower | 2.3× faster | 20 |
| Extract a subtree<br><sub>deep copy of users/1500</sub> | plain | 2.4 µs |  | 1.4× faster |  |
|  | walk | 3.2 µs | 1.4× slower |  |  |
|  | dt from+set | 0.01 ms | 4.4× slower | 3.2× slower | never |
| Aggregate<br><sub>sum of all order totals</sub> | plain | 0.03 ms |  | 14.3× faster |  |
|  | walk | 1.89 ms | 61.3× slower |  |  |
|  | walk pruned | 0.44 ms | 14.3× slower |  |  |
|  | dt look all | 0.79 ms | 25.6× slower | 1.8× slower | never |
|  | dt custom filter | 0.19 ms | 6.1× slower | 2.3× faster | 64 |
| Full scan<br><sub>count every primitive value</sub> | plain | 0.27 ms |  | 7.0× faster |  |
|  | walk | 1.87 ms | 7.0× slower |  |  |
|  | dt look all | 0.77 ms | 2.9× slower | 2.4× faster | 15 |

### 20,000 users (180,003 dt-lines)

#### Preparation

| Step | Time |
|---|---:|
| JSON.parse (std text) | 18.7 ms |
| dtbox.init (object in memory) | 220.0 ms |
| JSON.parse + dtbox.init | 253.5 ms |
| JSON.parse (DT-model text) + dtbox.load | 156.6 ms |
| dt.setupFilter ('orderItems'), once | 9.01 ms |

| Size | Value |
|---|---:|
| std JSON text | 4.1 MiB |
| DT-model JSON text | 15.0 MiB |
| heap kept by plain object | 9.6 MiB |
| heap kept by dt-object | 68.9 MiB |
| heap kept by dt-object + 'orderItems' filter | 69.2 MiB |

#### Search

Break-even: how many queries the dt version needs before the conversion (JSON.parse + dtbox.init minus JSON.parse = 234.8 ms) is paid back by faster queries, compared with the fastest walk version of the same task. `never` means the dt query itself is not faster.

| Task | Implementation | Time | vs plain | vs best walk | Break-even vs best walk |
|---|---|---:|---:|---:|---:|
| Point read by path<br><sub>users/15000/profile/address/zip</sub> | plain | 0.1 µs |  | 19116.3× faster |  |
|  | walk | 2.39 ms | 19116.3× slower |  |  |
|  | dt index | 0.8 µs | 6.7× slower | 2868.6× faster | 99 |
| Collect a key anywhere<br><sub>all 'city' values (20000)</sub> | plain | 0.16 ms |  | 95.1× faster |  |
|  | walk | 20.7 ms | 133.5× slower |  |  |
|  | walk pruned | 14.8 ms | 95.1× slower |  |  |
|  | dt look all | 6.99 ms | 45.0× slower | 2.1× faster | 31 |
|  | dt find+look | 1.38 ms | 8.9× slower | 10.7× faster | 18 |
| Objects by name<br><sub>zip of every 'address' object (20000)</sub> | plain | 0.17 ms |  | 97.8× faster |  |
|  | walk | 16.7 ms | 97.8× slower |  |  |
|  | dt find+look | 1.05 ms | 6.2× slower | 15.8× faster | 16 |
| Filter records<br><sub>ids of active users with age >= 80</sub> | plain | 0.13 ms |  | 8.2× faster |  |
|  | walk | 1.09 ms | 8.2× slower |  |  |
|  | dt find+index | 1.71 ms | 13.0× slower | 1.6× slower | never |
| First match, early exit<br><sub>path of zip '20000' (record in the middle)</sub> | plain | 0.09 ms |  | 224.0× faster |  |
|  | walk | 21.0 ms | 224.0× slower |  |  |
|  | dt find+look | 0.59 ms | 6.3× slower | 35.5× faster | 12 |
|  | dt look all | 5.35 ms | 57.1× slower | 3.9× faster | 16 |
| Extract a subtree<br><sub>deep copy of users/15000</sub> | plain | 2.3 µs |  | 1.5× faster |  |
|  | walk | 3.4 µs | 1.5× slower |  |  |
|  | dt from+set | 9.5 µs | 4.1× slower | 2.8× slower | never |
| Aggregate<br><sub>sum of all order totals</sub> | plain | 0.17 ms |  | 28.6× faster |  |
|  | walk | 24.3 ms | 141.6× slower |  |  |
|  | walk pruned | 4.89 ms | 28.6× slower |  |  |
|  | dt look all | 7.72 ms | 45.0× slower | 1.6× slower | never |
|  | dt custom filter | 1.58 ms | 9.2× slower | 3.1× faster | 71 |
| Full scan<br><sub>count every primitive value</sub> | plain | 2.68 ms |  | 8.4× faster |  |
|  | walk | 22.5 ms | 8.4× slower |  |  |
|  | dt look all | 8.26 ms | 3.1× slower | 2.7× faster | 17 |

### 100,000 users (900,003 dt-lines)

#### Preparation

| Step | Time |
|---|---:|
| JSON.parse (std text) | 123.8 ms |
| dtbox.init (object in memory) | 1404.7 ms |
| JSON.parse + dtbox.init | 1812.6 ms |
| JSON.parse (DT-model text) + dtbox.load | 1207.2 ms |
| dt.setupFilter ('orderItems'), once | 64.9 ms |

| Size | Value |
|---|---:|
| std JSON text | 20.5 MiB |
| DT-model JSON text | 75.9 MiB |
| heap kept by plain object | 48.4 MiB |
| heap kept by dt-object | 332.7 MiB |
| heap kept by dt-object + 'orderItems' filter | 334.0 MiB |

#### Search

Break-even: how many queries the dt version needs before the conversion (JSON.parse + dtbox.init minus JSON.parse = 1688.8 ms) is paid back by faster queries, compared with the fastest walk version of the same task. `never` means the dt query itself is not faster.

| Task | Implementation | Time | vs plain | vs best walk | Break-even vs best walk |
|---|---|---:|---:|---:|---:|
| Point read by path<br><sub>users/75000/profile/address/zip</sub> | plain | 0.1 µs |  | 148567.0× faster |  |
|  | walk | 18.6 ms | 148567.0× slower |  |  |
|  | dt index | 0.9 µs | 7.0× slower | 21223.9× faster | 91 |
| Collect a key anywhere<br><sub>all 'city' values (100000)</sub> | plain | 1.92 ms |  | 41.1× faster |  |
|  | walk | 109.9 ms | 57.1× slower |  |  |
|  | walk pruned | 79.2 ms | 41.1× slower |  |  |
|  | dt look all | 63.9 ms | 33.2× slower | 1.2× faster | 111 |
|  | dt find+look | 26.2 ms | 13.6× slower | 3.0× faster | 32 |
| Objects by name<br><sub>zip of every 'address' object (100000)</sub> | plain | 1.58 ms |  | 57.9× faster |  |
|  | walk | 91.3 ms | 57.9× slower |  |  |
|  | dt find+look | 15.5 ms | 9.8× slower | 5.9× faster | 23 |
| Filter records<br><sub>ids of active users with age >= 80</sub> | plain | 1.19 ms |  | 5.5× faster |  |
|  | walk | 6.55 ms | 5.5× slower |  |  |
|  | dt find+index | 29.5 ms | 24.8× slower | 4.5× slower | never |
| First match, early exit<br><sub>path of zip '60000' (record in the middle)</sub> | plain | 0.55 ms |  | 188.0× faster |  |
|  | walk | 103.6 ms | 188.0× slower |  |  |
|  | dt find+look | 5.91 ms | 10.7× slower | 17.5× faster | 18 |
|  | dt look all | 46.8 ms | 85.0× slower | 2.2× faster | 30 |
| Extract a subtree<br><sub>deep copy of users/75000</sub> | plain | 2.4 µs |  | 1.4× faster |  |
|  | walk | 3.2 µs | 1.4× slower |  |  |
|  | dt from+set | 9.1 µs | 3.8× slower | 2.8× slower | never |
| Aggregate<br><sub>sum of all order totals</sub> | plain | 0.80 ms |  | 34.0× faster |  |
|  | walk | 110.6 ms | 138.3× slower |  |  |
|  | walk pruned | 27.1 ms | 34.0× slower |  |  |
|  | dt look all | 67.0 ms | 83.8× slower | 2.5× slower | never |
|  | dt custom filter | 18.2 ms | 22.7× slower | 1.5× faster | 189 |
| Full scan<br><sub>count every primitive value</sub> | plain | 13.3 ms |  | 8.4× faster |  |
|  | walk | 111.1 ms | 8.4× slower |  |  |
|  | dt look all | 64.8 ms | 4.9× slower | 1.7× faster | 37 |



## Run it yourself

```bash
node benchmarks/search.mjs
```

Options:

| Option | Meaning |
|---|---|
| `--sizes 2000,20000,100000` | numbers of records, one section per size (default `2000,20000`) |
| `--runs 5` | processes per size (default 3) |

Larger sizes take longer: 100,000 records take about 4 minutes on the machine above, most of it creating dt-objects for the preparation timings.
