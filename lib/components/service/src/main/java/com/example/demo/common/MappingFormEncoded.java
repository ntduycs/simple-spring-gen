package com.example.demo.common;

import java.lang.annotation.*;

/**
 * @author duynt on 10/16/21
 *
 * All requests that are intended to be used with xxx-form-encoded content-type MUST be annotated with this annotation
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
public @interface MappingFormEncoded {
}
