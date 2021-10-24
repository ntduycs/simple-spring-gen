package com.example.demo.kafka.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    private final Environment environment;

    public KafkaProducerConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean("DemoKafkaProducerFactory")
    ProducerFactory<String, Object> customProducerFactory() {
        Map<String, Object> configMap = new HashMap<>();
        configMap.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, environment.getRequiredProperty("spring.kafka.bootstrap-servers"));

        configMap.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configMap.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // Ensure that exactly one copy of each message is written in the stream
        // Enabling idempotence requires
        // 1. <code>max.in.flight.requests.per.connection</code> to be less than or equal to 5,
        // 2. <code>retries</code> to be greater than 0 and
        // 3. <code>acks</code> must be 'all'
        configMap.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
        configMap.put(ProducerConfig.ACKS_CONFIG, "all");
        configMap.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, "5");
        configMap.put(ProducerConfig.RETRIES_CONFIG, "5");

        // For high throughput use-cause, linger add a delay to gather messages in batch before sending out between message transmissions
        // For higher performance use-case, linger should be minimized for better latency
        configMap.put(ProducerConfig.LINGER_MS_CONFIG, "50");
        // Only use when batching was configured, "snappy" not work on aarch64 architecture
        configMap.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "none");

        return new DefaultKafkaProducerFactory<>(configMap);
    }

    @Bean("DemoKafkaTemplate")
    KafkaTemplate<String, Object> customKafkaTemplate() {
        return new KafkaTemplate<>(customProducerFactory());
    }

}
