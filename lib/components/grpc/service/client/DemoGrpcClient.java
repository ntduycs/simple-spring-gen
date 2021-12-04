package com.example.demo.grpc.client;

import com.example.demo.proto.CreateSampleRequest;
import com.example.demo.proto.CreateSampleResponse;
import com.example.demo.proto.SampleServiceGrpc;
import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import io.grpc.stub.StreamObserver;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.concurrent.Executor;

/**
 * @author duynt on 10/23/21
 */
@Service
@Log4j2
public class DemoGrpcClient {

    private final Executor executor;

    private final SampleServiceGrpc.SampleServiceStub nonBlockingStub;
    private final SampleServiceGrpc.SampleServiceBlockingStub blockingStub;
    private final SampleServiceGrpc.SampleServiceFutureStub multiThreadStub;

    public DemoGrpcClient(Executor executor, SampleServiceGrpc.SampleServiceStub nonBlockingStub,
                            SampleServiceGrpc.SampleServiceBlockingStub blockingStub,
                            SampleServiceGrpc.SampleServiceFutureStub multiThreadStub) {
        this.executor = executor;
        this.nonBlockingStub = nonBlockingStub;
        this.blockingStub = blockingStub;
        this.multiThreadStub = multiThreadStub;
    }

    public CreateSampleResponse createSample(CreateSampleRequest request) {
        try {
            return blockingStub.createSample(request);
        } catch (Throwable e) {
            log.error("Error");
            return null;
        }
    }

    public void asyncCreateSample(CreateSampleRequest request) {
        nonBlockingStub.createSample(request, new StreamObserver<>() {
            @Override
            public void onNext(CreateSampleResponse createSampleResponse) {
                log.info("Done");
            }

            @Override
            public void onError(Throwable throwable) {
                log.error("Error");
            }

            @Override
            public void onCompleted() {
                log.info("Completed");
            }
        });
    }

    public ListenableFuture<CreateSampleResponse> threadedCreateSample(CreateSampleRequest request) {
        ListenableFuture<CreateSampleResponse> future = multiThreadStub.createSample(request);

        Futures.addCallback(future, new FutureCallback<>() {
            @Override
            public void onSuccess(CreateSampleResponse createSampleResponse) {
                log.info("Done");
            }

            @Override
            public void onFailure(Throwable throwable) {
                log.error("Error");
            }
        }, executor);

        return future;
    }

}
