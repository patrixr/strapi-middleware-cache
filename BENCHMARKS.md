# Benchmarks

## Context

- Rest cache version: `4.2.4`
- Strapi version: `4.1.5`
- Node version: `16.13.2`
- Endpoint used: `/api/homepage?populate=*` from `shared/api`

## Runs

### Cache disabled (reference)

```sh
$ ENABLE_CACHE=false yarn profile:memory
```

| Stat        | 2.5%    | 50%     | 97.5%   | 99%     | Avg        | Stdev     | Max     |
| ----------- | ------- | ------- | ------- | ------- | ---------- | --------- | ------- |
| **Latency** | 2424 ms | 2555 ms | 2921 ms | 3012 ms | 2565.12 ms | 133.23 | 3401 ms |

| Stat          | 1%  | 2.5% | 50%    | 97.5%   | Avg    | Stdev  | Min    |
| ------------- | --- | ---- | ------ | ------- | ------ | ------ | ------ |
| **Req/Sec**   | 0   | 0    | 386    | 1000    | 383.34 | 382.38 | 39     |
| **Bytes/Sec** | 0 B | 0 B  | 453 kB | 1.17 MB | 450 kB | 449 kB | 45.7 kB |

### Cache enabled (without etag)

```sh
$ ENABLE_ETAG=false yarn profile:memory
```

| Stat        | 2.5%   | 50%    | 97.5%  | 99%    | Avg       | Stdev   | Max    |
| ----------- | ------ | ------ | ------ | ------ | --------- | ------- | ------ |
| **Latency** | 113 ms | 116 ms | 166 ms | 175 ms | 120.04 ms | 12.86 ms | 275 ms |

| Stat          | 1%      | 2.5%    | 50%     | 97.5%   | Avg     | Stdev  | Min     |
| ------------- | ------- | ------- | ------- | ------- | ------- | ------ | ------- |
| **Req/Sec**   | 7451    | 7523    | 8287    | 8687    | 8293.49 | 306.35 | 6381    |
| **Bytes/Sec** | 8.85 MB | 8.93 MB | 9.84 MB | 10.3 MB | 9.84 MB | 364 kB | 7.57 MB |

### Cache enabled (with etag)

```sh
$ yarn profile:memory
```

| Stat        | 2.5%   | 50%    | 97.5%  | 99%    | Avg       | Stdev    | Max    |
| ----------- | ------ | ------ | ------ | ------ | --------- | -------- | ------ |
| **Latency** | 119 ms | 125 ms | 185 ms | 197 ms | 131.05 ms | 16.87 ms | 307 ms |

| Stat          | 1%      | 2.5%    | 50%     | 97.5%   | Avg     | Stdev  | Min     |
| ------------- | ------- | ------- | ------- | ------- | ------- | ------ | ------- |
| **Req/Sec**   | 6551    | 6559    | 7651    | 8231    | 7599.39 | 472.94  | 6100    |
| **Bytes/Sec** | 8.05 MB | 8.07 MB | 9.4 MB | 10.1 MB | 9.34 MB | 581 kB | 7.5 MB |
