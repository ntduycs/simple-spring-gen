package com.example.demo;

import lombok.extern.log4j.Log4j2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.client.test.OAuth2ContextConfiguration;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;

import java.net.InetAddress;
import java.net.UnknownHostException;

@Log4j2
@SpringBootApplication
@EnableResourceServer
@OAuth2ContextConfiguration
public class DemoServiceApplication {

    public static void main(String[] args) throws UnknownHostException {
        Environment env = SpringApplication.run(DemoServiceApplication.class, args).getEnvironment();

        final String application = env.getRequiredProperty("spring.application.name");
        final String port = env.getRequiredProperty("server.port");

        log.info("\n\n----------------------------------------------------------\n" +
                        "\tApplication '{}' is running! Access URLs:\n" +
                        "\tLocal address: \t\tlocalhost:{}\n" +
                        "\tExternal address: \t{}:{}\n" +
                        "----------------------------------------------------------\n",
                application, port, InetAddress.getLocalHost().getHostAddress(), port);
    }

}
