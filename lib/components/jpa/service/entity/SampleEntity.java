package com.example.demo.domain.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.time.OffsetDateTime;

/**
 * @author duynt on 10/22/21
 */
@Getter
@Setter
@Entity
@Table(name = "sample")
public class SampleEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstname;

    private String lastname;

    private String email;

    private OffsetDateTime birthday;

    private String avatar;
}
