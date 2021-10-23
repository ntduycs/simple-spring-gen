package com.example.demo.service.impl;

import com.example.demo.service.SampleService;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

@Service
@Log4j2
public class SampleServiceImpl implements SampleService {

    @Override
    public String execute(String action) {
        log.info("Executing {}", action);

        return "Done";
    }

}
