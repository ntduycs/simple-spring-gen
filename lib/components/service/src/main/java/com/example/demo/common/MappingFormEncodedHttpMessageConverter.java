package com.example.demo.common;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * @author duynt on 10/16/21
 *
 * Add support application/x-www-form-urlencoded for Spring
 */
public class MappingFormEncodedHttpMessageConverter extends AbstractHttpMessageConverter<Object> {
    private static final FormHttpMessageConverter FORM_HTTP_MESSAGE_CONVERTER = new FormHttpMessageConverter();
    private static final MappingJackson2HttpMessageConverter JACKSON_HTTP_MESSAGE_CONVERTER = new MappingJackson2HttpMessageConverter();

    private static final ObjectMapper objectMapper = new ObjectMapper().setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

    public MappingFormEncodedHttpMessageConverter() {
        super(new MediaType("application", "x-www-form-urlencoded", StandardCharsets.UTF_8));
    }

    @Override
    protected boolean supports(Class<?> clazz) {
        return clazz.isAnnotationPresent(MappingFormEncoded.class);
    }

    @Override
    protected Object readInternal(Class<?> clazz, HttpInputMessage inputMessage) throws IOException, HttpMessageNotReadableException {
        return JACKSON_HTTP_MESSAGE_CONVERTER.read(clazz, inputMessage);
    }

    @Override
    protected void writeInternal(Object o, HttpOutputMessage outputMessage) throws IOException, HttpMessageNotWritableException {
        Map<String, Object> valueMap = objectMapper.convertValue(o, new TypeReference<>() {});

        MultiValueMap<String, Object> multiValueMap = new LinkedMultiValueMap<>();

        for (String key : valueMap.keySet()) {
            if (valueMap.get(key) instanceof Collection) {
                multiValueMap.put(key, (List<Object>) valueMap.get(key));
            } else {
                multiValueMap.add(key, valueMap.get(key));
            }
        }

        FORM_HTTP_MESSAGE_CONVERTER.write(multiValueMap, MediaType.APPLICATION_FORM_URLENCODED, outputMessage);
    }
}
