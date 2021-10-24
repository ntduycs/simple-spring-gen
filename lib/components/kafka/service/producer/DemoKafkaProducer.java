package com.example.demo.kafka.producer;

import com.example.demo.kafka.DemoKafkaCommand;
import com.example.demo.kafka.DemoKafkaTopic;
import com.example.demo.kafka.message.DemoCommandMessage;
import com.example.demo.kafka.message.DemoTrackingMessage;
import lombok.extern.log4j.Log4j2;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@Log4j2
public class DemoKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public DemoKafkaProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendSampleCommandMessage() {
        SampleCommandMessage message = SampleCommandMessage.newBuilder()
                .setCommand(DemoKafkaCommand.INSERT_USER)
                .setFirstname("Duy")
                .setLastname("Nguyen Thanh")
                .build();

        send(message);
    }

    public void sendSampleTrackingMessage() {
        SampleTrackingMessage message = SampleTrackingMessage.newBuilder()
                .setFirstname("Duy")
                .setLastname("Nguyen Thanh")
                .build();

        send(message);
    }

    public void sendSampleUnknownMessage() {
        Map<String, Object> message = new LinkedHashMap<>();

        message.put("firstname", "Duy");

        send(message);
    }

    private void send(Object message) {
        ListenableFuture<SendResult<String, Object>> future = kafkaTemplate.send(DemoKafkaTopic.DEMO_TOPIC, message);

        future.addCallback(new ListenableFutureCallback<>() {
            @Override
            public void onFailure(Throwable ex) {
                log.error("Failed to send message to topic. {} - {}", ex.getClass().getSimpleName(), ex.getMessage());
            }

            @Override
            public void onSuccess(SendResult<String, Object> result) {
                log.info("Succeed to send message to topic {}", result.getRecordMetadata().topic());
            }
        });
    }
}
