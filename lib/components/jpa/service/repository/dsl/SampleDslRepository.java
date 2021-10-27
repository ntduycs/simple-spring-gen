package com.example.demo.domain.repository.dsl;

import com.example.demo.domain.entity.QSampleEntity;
import com.example.demo.domain.entity.SampleEntity;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

@Repository
public class SampleDslRepository {

    private final QSampleEntity sample = QSampleEntity.sampleEntity;

    private final JPAQueryFactory queryBuilder;

    public SampleDslRepository(JPAQueryFactory queryBuilder) {
        this.queryBuilder = queryBuilder;
    }

    public List<SampleEntity> findAllSamples4List(String searchTerm) {
        JPAQuery<SampleEntity> query = queryBuilder.select(sample).from(sample);

        if (StringUtils.hasText(searchTerm)) {
            query.where(sample.firstname.containsIgnoreCase(searchTerm)
                    .or(sample.lastname.containsIgnoreCase(searchTerm))
                    .or(sample.email.containsIgnoreCase(searchTerm)));
        }

        return query.fetch();
    }

}
