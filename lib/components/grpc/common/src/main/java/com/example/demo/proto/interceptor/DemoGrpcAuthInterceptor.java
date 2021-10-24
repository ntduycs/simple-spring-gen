package com.example.demo.proto.interceptor;

import io.grpc.*;
import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.demo.proto.constant.DemoGrpcConstant;
import com.example.demo.proto.constant.DemoGrpcPrincipal;

public class DemoGrpcAuthInterceptor implements ServerInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(DemoGrpcAuthInterceptor.class);

    private final JwtParser jwtParser = Jwts.parser().setSigningKey(DemoGrpcConstant.JWT_SIGNING_KEY);

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(ServerCall<ReqT, RespT> call, Metadata metadata, ServerCallHandler<ReqT, RespT> next) {
        String key = metadata.get(DemoGrpcConstant.AUTHORIZATION_METADATA_KEY);

        Status status = Status.OK;

        if (key == null || key.isBlank()) {
            status = Status.UNAUTHENTICATED.withDescription("Authorization token is missing");
        } else if (!key.startsWith(DemoGrpcConstant.JWT_BEARER_PREFIX)) {
            status = Status.UNAUTHENTICATED.withDescription("Invalid authorization token type");
        } else {
            Jws<Claims> jws = null;

            String jwtToken = key.substring(DemoGrpcConstant.JWT_BEARER_PREFIX.length()).trim();

            try {
                jws = jwtParser.parseClaimsJws(jwtToken);
            } catch (JwtException e) {
                logger.error("Error when parsing grpc auth token. Exception {} - {}", e.getClass().getSimpleName(), e.getMessage());
                status = Status.UNAUTHENTICATED.withDescription(e.getMessage()).withCause(e);
            }

            if (status.isOk() && isValidJwtClaims(jws)) {
                Context context = Context.current().withValue(DemoGrpcConstant.IDENTITY_CONTEXT_KEY, rebuildIdentity(jws));
                return Contexts.interceptCall(context, call, metadata, next);
            } else if (status.isOk()) { // invalid jwt claims, isValidJwtClaims() returns false
                status = Status.UNAUTHENTICATED.withDescription("Invalid authorization token payload");
            }
        }

        // Cancel the call
        call.close(status, new Metadata());

        return new ServerCall.Listener<>() {
            // Do nothing
        };
    }

    private DemoGrpcPrincipal rebuildIdentity(Jws<Claims> jws) {
        Claims claims = jws.getBody();

        DemoGrpcPrincipal identity = new DemoGrpcPrincipal();

        identity.setUserId(claims.get("user_id", Long.class));
        identity.setUsername(claims.get("username", String.class));
        identity.setEmail(claims.get("email", String.class));
        identity.setFirstName(claims.get("first_name", String.class));
        identity.setLastName(claims.get("last_name", String.class));
        identity.setSchoolId(claims.get("school_id", Long.class));

        identity.setRole(claims.get("role", String.class));

        identity.setAuthenticated(true);

        return identity;
    }

    private boolean isValidJwtClaims(Jws<Claims> jws) {
        if (jws == null || jws.getBody() == null) {
            return false;
        }

        Claims claims = jws.getBody();

        return claims.containsKey("user_id") && claims.get("user_id", Long.class) != null;
    }

}