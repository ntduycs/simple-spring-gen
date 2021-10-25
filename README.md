# Simple Spring Gen - Spring Boot Starter Code Generator

===================

[![npm Package](https://img.shields.io/npm/v/simple-spring-gen.svg?style=flat-square)](https://www.npmjs.org/package/simple-spring-gen)

## System Requirements

- `node`: v8.0.0+ - `sudo apt install node`
- `npm`: v6.0.0+ - `sudo apt install npm`
- `npx`: installed - `sudo npm i -g npx`

## :cloud: Quick Start

The quickest way to get started is use `npx` and pass in the required parameters of the project you want to create.

```shell
npx simple-spring-gen --groupId=<groupId> --artifactId=<artifactId> [--grpc] [--kafka] [--jpa]
```

Example:

```shell
npx simple-spring-gen --groupId=io.ntduycs --artifactId=account-service --grpc --jpa
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

OPTIONAL - If the `--kafka` parameter was passed, we need to compile the Kafka module before being possible start Spring app

```shell
# Compile grpc module
cd "<project-dir>/<project-dir>-kafka"
mvn clean install
```

OPTIONAL - If the `--jpa` parameter was passed, we need to compile JPA entities before being possible start Spring app. For starter purpose, the codegen includes a sample entity (`SampleEntity`),
 you should remove them and add your business entities and compile them before start Spring instance

```shell
# Compile entities
cd "<project-dir>/<project-dir>-service"
mvn clean install
```

RECOMMENDED - You might want to look at `.yaml` files at `resources` folder and make some updates on it.

## :clipboard: Available Options

- `--groupId` - REQUIRED - Maven group ID
- `--artifactId` - REQUIRED - Maven artifact ID, should have the `-service` suffix (e.g., `product-service`, `notification-serivce`)
- `--grpc` - OPTIONAL - Add gRPC supports.
- `--kafka` - OPTIONAL - Add Kafka supports.
- `--jpa` - OPTIONAL - Add JPA, Flyway & Querydsl supports. Currently, it is only supported for Postgres.

Thanks! :heart: