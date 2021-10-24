package com.example.demo.grpc.config;

import com.example.demo.proto.SampleServiceGrpc;
import io.grpc.ManagedChannel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author duynt on 10/23/21
 */
@Configuration
public class DemoGrpcStubConfig {

    @Bean
    public SampleServiceGrpc.SampleServiceStub nonBlockingSampleGrpcStub(@Qualifier("DemoGrpcChannel") ManagedChannel channel) {
        return SampleServiceGrpc.newStub(channel);
    }

    @Bean
    public SampleServiceGrpc.SampleServiceBlockingStub blockingSampleGrpcStub(@Qualifier("DemoGrpcChannel") ManagedChannel channel) {
        return SampleServiceGrpc.newBlockingStub(channel);
    }

    @Bean
    public SampleServiceGrpc.SampleServiceFutureStub multithreadingSampleGrpcStub(@Qualifier("DemoGrpcChannel") ManagedChannel channel) {
        return SampleServiceGrpc.newFutureStub(channel);
    }

}
