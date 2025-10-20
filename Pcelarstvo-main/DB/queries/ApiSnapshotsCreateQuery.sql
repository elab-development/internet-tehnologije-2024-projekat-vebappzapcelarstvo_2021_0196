CREATE TABLE ApiSnapshots (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    source          VARCHAR(50)     NOT NULL,  
    query_params    VARCHAR(1000)   NULL,
    payload         NVARCHAR(MAX)   NOT NULL,  
    collected_at    DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);
