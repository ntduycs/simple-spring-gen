package com.example.demo.proto.constant;

import com.google.common.net.HttpHeaders;
import io.grpc.Context;
import io.grpc.Metadata;

public class DemoGrpcConstant {

    public static final long JWT_EXPIRATION = 1000 * 60 * 5; // 5 mins
    public static final String JWT_SIGNING_KEY = "s4dli3rc0nn3ct-2021";
    public static final String JWT_BEARER_PREFIX = "Bearer";

    public static final Metadata.Key<String> AUTHORIZATION_METADATA_KEY = Metadata.Key.of(HttpHeaders.AUTHORIZATION, Metadata.ASCII_STRING_MARSHALLER);

    public static final Context.Key<DemoGrpcPrincipal> IDENTITY_CONTEXT_KEY = Context.key("grpc_user_identity");

}