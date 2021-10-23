set search_path to postgres;

delete from ms_properties where application = 'demo-service';

insert into ms_properties (application, profile, label, key, value)
values ('demo-service', 'default', 'master', 'server.servlet.context-path', '/api/v1'),
;