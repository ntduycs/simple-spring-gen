package com.example.demo.grpc.config;

import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author duynt on 10/23/21
 */
@Configuration
public class DemoGrpcChannelConfig {

    @Bean("DemoGrpcChannel")
    public ManagedChannel sampleChannel() {
        return ManagedChannelBuilder.forAddress("0.0.0.0", 9090)
                .usePlaintext()
                .build();
    }

//     @Bean("licenseGrpcChannel")
//     public ManagedChannel licenseGrpcChannel() {
//         String host = environment.getRequiredProperty("grpc.license.host");
//         Integer port = environment.getRequiredProperty("grpc.license.port", Integer.class);
//
//         return ManagedChannelBuilder.forAddress(host, port)
//                 .usePlaintext()
//                 .build();
//     }

//     @Bean("accountGrpcChannel")
//     public ManagedChannel accountGrpcChannel() {
//         String host = environment.getRequiredProperty("grpc.account.host");
//         Integer port = environment.getRequiredProperty("grpc.account.port", Integer.class);
//
//         return ManagedChannelBuilder.forAddress(host, port)
//                 .usePlaintext()
//                 .build();
//     }

}
