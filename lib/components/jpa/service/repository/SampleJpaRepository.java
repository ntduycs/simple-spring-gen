package com.example.demo.domain.repository;

import com.example.demo.domain.entity.SampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SampleJpaRepository extends JpaRepository<SampleEntity, Long> {
}
