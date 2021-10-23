package com.example.demo.kafka.config;

import com.example.demo.kafka.DemoKafkaTopic;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaAdminConfig {

    private final Environment environment;

    public KafkaAdminConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    KafkaAdmin kafkaAdmin() {
        Map<String, Object> configMap = new HashMap<>();
        configMap.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, environment.getRequiredProperty("spring.kafka.bootstrap-servers"));

        return new KafkaAdmin(configMap);
    }

    //@Bean
    //NewTopic demoUserTopic() {
    //    return new NewTopic(DemoKafkaTopic.DEMO_TOPIC, 3, (short) 1);
    //}

}
