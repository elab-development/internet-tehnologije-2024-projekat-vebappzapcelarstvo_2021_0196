CREATE TABLE dbo.Tasks (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    title           VARCHAR(200)       NOT NULL,
    description     VARCHAR(2000)      NULL,
    start_at        DATETIME2          NOT NULL,   
    end_at          DATETIME2          NULL,      
    created_by      INT                NOT NULL,   
    source_type     VARCHAR(50)        NULL,      
    source_payload  NVARCHAR(MAX)      NULL,      
    created_at      DATETIME2          NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Tasks_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(id)
);
