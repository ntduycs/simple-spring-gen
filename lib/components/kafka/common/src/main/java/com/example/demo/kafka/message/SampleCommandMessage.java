package com.example.demo.kafka.message;

import com.example.demo.kafka.DemoKafkaCommand;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder(builderMethodName = "newBuilder", setterPrefix = "set")
public class SampleCommandMessage implements Serializable {
    private DemoKafkaCommand command;

    private String firstname;
    private String lastname;
}