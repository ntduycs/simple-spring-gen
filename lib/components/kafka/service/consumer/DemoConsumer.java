package com.example.demo.kafka.consumer;

import com.example.demo.kafka.DemoKafkaTopic;
import com.example.demo.kafka.message.DemoCommandMessage;
import com.example.demo.kafka.message.DemoTrackingMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@KafkaListener(topics = {
        DemoKafkaTopic.DEMO_TOPIC
}, containerFactory = "demoKafkaListenerContainerFactory", groupId = "sample")
@Log4j2
public class DemoConsumer {

    private final ObjectMapper objectMapper;

    public DemoConsumer(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @KafkaHandler
    public void consumeDemoCommandMessage(@Payload DemoCommandMessage commandRequest) {
        log.info("Consume {} with command {} and content {} {}",
                commandRequest.getClass().getSimpleName(),
                commandRequest.getCommand(),
                commandRequest.getFirstname(),
                commandRequest.getLastname());
    }

    @KafkaHandler
    public void consumerDemoTrackingMessage(@Payload DemoTrackingMessage trackingRequest) {
        log.info("Consume {} with content {} {}",
                trackingRequest.getClass().getSimpleName(),
                trackingRequest.getFirstname(),
                trackingRequest.getLastname());
    }

    @KafkaHandler(isDefault = true)
    public void consumeUnrecognizedMessage(Object unrecognizedMessage) {
        try {
            log.warn("Unrecognized message found with type {} and content {}", unrecognizedMessage.getClass().getSimpleName(), objectMapper.writeValueAsString(unrecognizedMessage));
        } catch (JsonProcessingException e) {
            log.error("Error when write message to string. {}", e.getMessage());
            log.warn("Unrecognized malformed message found with type {}", unrecognizedMessage.getClass().getSimpleName());
        }
    }

}