package com.example.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsResourceDetails;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.provider.token.RemoteTokenServices;

/**
 * @author duynt on 10/22/21
 */
@Configuration
public class ResourceServerConfig extends ResourceServerConfigurerAdapter {

    private final Environment environment;

    public ResourceServerConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    @ConfigurationProperties(prefix = "security.oauth2.client")
    public ClientCredentialsResourceDetails clientCredentialsResourceDetails() {
        return new ClientCredentialsResourceDetails();
    }

    @Bean
    public OAuth2RestTemplate clientCredentialsRestTemplate() {
        return new OAuth2RestTemplate(clientCredentialsResourceDetails());
    }

    @Primary
    @Bean
    public RemoteTokenServices tokenService() {
        RemoteTokenServices tokenService = new RemoteTokenServices();

        tokenService.setCheckTokenEndpointUrl(environment.getRequiredProperty("security.oauth2.resource.check-token-endpoint-url"));
        tokenService.setClientId(environment.getRequiredProperty("security.oauth2.client.client-id"));
        tokenService.setClientSecret(environment.getRequiredProperty("security.oauth2.client.client-secret"));

        return tokenService;
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers(
                        "/uaa/**",
                        "/api-docs/**",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/actuator/**",
                        "/sample/**"
                )
                .permitAll()
                .antMatchers("/administrator/**", "/ciu/administrator/**").hasAnyAuthority("ADMIN")
                .antMatchers("/district/**", "/ciu/district/**").hasAnyAuthority("DISTRICT")
                .antMatchers("/admin/**", "/ciu/admin/**").hasAnyAuthority("SCHOOL")
                .antMatchers("/teacher/**", "/ciu/teacher/**").hasAnyAuthority("TEACHER")
                .antMatchers("/student/**", "/ciu/student/**").hasAnyAuthority("STUDENT")
                .antMatchers("/parent/**", "/ciu/parent/**").hasAnyAuthority("PARENT")
                .antMatchers("/sale/**", "/ciu/sale/**").hasAnyAuthority("SALE")
                .anyRequest().authenticated();
    }

}
