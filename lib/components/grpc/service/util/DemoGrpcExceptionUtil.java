package com.example.demo.grpc.util;

import com.example.demo.proto.common.DemoGrpcError;
import com.example.demo.proto.common.DemoGrpcErrorCode;

/**
 * @author duynt on 10/23/21
 */
public class DemoGrpcExceptionUtil {
    private DemoGrpcExceptionUtil() {
    }

    public static DemoGrpcError asGrpcError(Exception exception) {
        DemoGrpcError.Builder builder = DemoGrpcError.newBuilder()
                .setCode(DemoGrpcErrorCode.UNKNOWN)
                .setMessage(exception.getClass().getSimpleName() + " - " + exception.getMessage());

        if (exception.getCause() != null) {
            Throwable cause = exception.getCause();
            builder.putErrors("cause", String.format("%s - %s", cause.getClass().getSimpleName(), cause.getMessage()));
        }

        return builder.build();
    }
}
