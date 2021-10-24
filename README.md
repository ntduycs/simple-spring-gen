# Simple Spring Gen - Spring Boot Starter Code Generator

===================

[![npm Package](https://img.shields.io/npm/v/simple-spring-gen.svg?style=flat-square)](https://www.npmjs.org/package/simple-spring-gen)

## :cloud: Quick Start

The quickest way to get started is use `npx` and pass in the required parameters of the project you want to create.

```shell
npx simple-spring-gen --groupId=<groupId> --artifactId=<artifactId> [--grpc] [--kafka]
```

Example:

```shell
npx simple-spring-gen --groupId=io.ntduycs --artifactId=account-service --grpc
npx simple-spring-gen --groupId=io.ntduycs --artifactId=product-service --kafa
npx simple-spring-gen --groupId=io.ntduycs --artifactId=notification-service --grpc --kafka
```

The process will take about 1-2 minutes based on your network. After that, your project is in ready-to-start. Start your SpringBoot app as usual:

OPTIONAL - If the `--grpc` parameter was passed, we need to compile the gRPC module before being possible start Spring app

```shell
# Compile grpc module
cd "<project-dir>/<project-dir>-grpc"
mvn clean install
```

## :clipboard: Available Options

- `--groupId` - REQUIRED - Maven group ID
- `--artifactId` - REQUIRED - Maven artifact ID, should have the `-service` suffix (e.g., `product-service`, `notification-serivce`)
- `--grpc` - OPTIONAL - Add gRPC supports.
- `--kafka` - OPTIONAL - Add Kafka supports.

Thanks! :heart: