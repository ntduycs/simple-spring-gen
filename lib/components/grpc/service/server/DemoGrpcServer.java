package com.example.demo.grpc.server;

import com.example.demo.grpc.util.DemoGrpcExceptionUtil;
import com.example.demo.proto.CreateSampleRequest;
import com.example.demo.proto.CreateSampleResponse;
import com.example.demo.proto.SampleServiceGrpc;
import com.example.demo.service.SampleService;
import io.grpc.stub.StreamObserver;
import lombok.extern.log4j.Log4j2;
import net.devh.boot.grpc.server.service.GrpcService;

/**
 * @author duynt on 10/23/21
 */
@Log4j2
@GrpcService
public class DemoGrpcServer extends SampleServiceGrpc.SampleServiceImplBase {

    private final SampleService sampleService;

    public DemoGrpcServer(SampleService sampleService) {
        this.sampleService = sampleService;
    }

    @Override
    public void createSample(CreateSampleRequest request, StreamObserver<CreateSampleResponse> responseObserver) {
        try {
            og.info(sampleService.execute("hello world"));

            responseObserver.onNext(CreateSampleResponse.newBuilder()
                    .setSuccess(true)
                    .setData(CreateSampleResponse.Data.newBuilder()
                            .setFirstname("Duy")
                            .setLastname("Nguyen Thanh")
                            .build())
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onNext(CreateSampleResponse.newBuilder()
                    .setSuccess(false)
                    .setError(DemoGrpcExceptionUtil.asGrpcError(e))
                    .build());
            responseObserver.onCompleted();
            throw e;
        }
    }

}
