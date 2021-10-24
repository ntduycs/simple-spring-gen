package com.example.demo.proto.constant;

import io.grpc.CallCredentials;
import io.grpc.Metadata;
import io.grpc.Status;
import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Timestamp;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.Executor;

/**
 * @author duynt on 10/10/21
 *
 * CallCredentials implementation, which carries the JWT value that will be propagated to the
 * server in the request metadata with the "Authorization" key and the "Bearer" prefix.
 */
public class DemoGrpcCredentials extends CallCredentials {

    private static final Logger logger = LoggerFactory.getLogger(DemoGrpcCredentials.class);

    private final DemoGrpcPrincipal identity;
    private final String issuer;
    private final String audience;

    public DemoGrpcCredentials(DemoGrpcPrincipal identity, String issuer, String audience) {
        this.identity = identity;
        this.issuer = issuer;
        this.audience = audience;
    }

    /////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////
    //
    // Follows partial good practices ref at https://datatracker.ietf.org/doc/html/rfc7519
    // We use symmetric signing key to reduce the cost of token signing/verifying
    // Because the token is intentionally used for intercommunication only
    //
    /////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////
    @Override
    public void applyRequestMetadata(RequestInfo requestInfo, Executor executor, MetadataApplier applier) {
        final String jwt = generateJwtToken();

        executor.execute(() -> {
            try {
                Metadata metadata = new Metadata();
                metadata.put(DemoGrpcConstant.AUTHORIZATION_METADATA_KEY, String.format("%s %s", DemoGrpcConstant.JWT_BEARER_PREFIX, jwt));
                applier.apply(metadata);
            } catch (Throwable e) {
                logger.error("Cannot apply RPC request metadata. Exception {} - {}", e.getClass().getSimpleName(), e.getMessage());
                applier.fail(Status.UNAUTHENTICATED.withDescription(e.getMessage()).withCause(e));
            }
        });
    }

    private String generateJwtToken() {
        Map<String, Object> additionalClaims = new LinkedHashMap<>();

        additionalClaims.put("user_id", identity.getUserId());
        additionalClaims.put("username", identity.getUsername());
        additionalClaims.put("email", identity.getEmail());
        additionalClaims.put("first_name", identity.getFirstName());
        additionalClaims.put("last_name", identity.getLastName());
        additionalClaims.put("role", identity.getRole());
        additionalClaims.put("school_id", identity.getSchoolId());

        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(identity.getUsername())
                .setAudience(audience)
                .setIssuedAt(getCurrentTimestamp())
                .setNotBefore(getCurrentTimestamp())
                .setExpiration(getExpirationTimestamp())
                .setHeaderParam(JwsHeader.ALGORITHM, "")
                .setClaims(additionalClaims)
                .signWith(SignatureAlgorithm.HS256, DemoGrpcConstant.JWT_SIGNING_KEY)
                .compact();
    }

    private Date getCurrentTimestamp() {
        return new Timestamp(System.currentTimeMillis());
    }

    private Date getExpirationTimestamp() {
        return new Timestamp(System.currentTimeMillis() + DemoGrpcConstant.JWT_EXPIRATION);
    }

    @Override
    public void thisUsesUnstableApi() {
        // Do nothing
    }
}