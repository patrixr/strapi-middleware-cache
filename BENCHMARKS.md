# Benchmarks

## Context

- Rest cache version: `4.2.2`
- Strapi version: `4.1.0`
- Endpoint used: `/api/homepage?populate=*` from `playground/memory`

## Runs

### Cache disabled (reference)

```sh
$ ENABLE_CACHE=false yarn profile
```

| Stat        | 2.5%    | 50%     | 97.5%   | 99%     | Avg        | Stdev     | Max     |
| ----------- | ------- | ------- | ------- | ------- | ---------- | --------- | ------- |
| **Latency** | 2707 ms | 2834 ms | 3322 ms | 3451 ms | 2851.15 ms | 137.25 ms | 3659 ms |

| Stat          | 1%  | 2.5% | 50%    | 97.5%   | Avg    | Stdev  | Min    |
| ------------- | --- | ---- | ------ | ------- | ------ | ------ | ------ |
| **Req/Sec**   | 0   | 0    | 153    | 1000    | 348.89 | 378.71 | 6      |
| **Bytes/Sec** | 0 B | 0 B  | 176 kB | 1.15 MB | 401 kB | 436 kB | 6.9 kB |

### Cache enabled (without etag)

```sh
$ ENABLE_CACHE=true ENABLE_ETAG=false yarn profile
```

| Stat        | 2.5%   | 50%    | 97.5%  | 99%    | Avg       | Stdev   | Max    |
| ----------- | ------ | ------ | ------ | ------ | --------- | ------- | ------ |
| **Latency** | 118 ms | 127 ms | 188 ms | 201 ms | 132.14 ms | 17.5 ms | 306 ms |

| Stat          | 1%      | 2.5%    | 50%     | 97.5%   | Avg     | Stdev  | Min     |
| ------------- | ------- | ------- | ------- | ------- | ------- | ------ | ------- |
| **Req/Sec**   | 5663    | 6211    | 7591    | 8231    | 7536.72 | 518.32 | 4790    |
| **Bytes/Sec** | 6.59 MB | 7.23 MB | 8.84 MB | 9.58 MB | 8.77 MB | 603 kB | 5.58 MB |

### Cache enabled (with etag)

```sh
$ ENABLE_CACHE=true ENABLE_ETAG=true yarn profile
```

| Stat        | 2.5%   | 50%    | 97.5%  | 99%    | Avg       | Stdev    | Max    |
| ----------- | ------ | ------ | ------ | ------ | --------- | -------- | ------ |
| **Latency** | 123 ms | 131 ms | 190 ms | 207 ms | 137.06 ms | 17.42 ms | 302 ms |

| Stat          | 1%      | 2.5%    | 50%     | 97.5%   | Avg     | Stdev  | Min     |
| ------------- | ------- | ------- | ------- | ------- | ------- | ------ | ------- |
| **Req/Sec**   | 5599    | 5747    | 7311    | 7923    | 7267.47 | 476.6  | 5591    |
| **Bytes/Sec** | 6.75 MB | 6.93 MB | 8.82 MB | 9.55 MB | 8.76 MB | 575 kB | 6.74 MB |
