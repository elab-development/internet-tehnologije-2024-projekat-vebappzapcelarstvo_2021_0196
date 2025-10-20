CREATE TABLE dbo.TaskAssignments (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    task_id         INT               NOT NULL,  
    beekeeper_id    INT               NOT NULL,  
    assigned_at     DATETIME2         NOT NULL DEFAULT SYSUTCDATETIME(),
    status          VARCHAR(20)       NOT NULL DEFAULT 'ASSIGNED', 
    done_at         DATETIME2         NULL,
    result_note     VARCHAR(1000)     NULL,      
    CONSTRAINT UQ_TaskAssignments UNIQUE(task_id, beekeeper_id),
    CONSTRAINT FK_TaskAssignments_Task FOREIGN KEY (task_id) REFERENCES Tasks(id),
    CONSTRAINT FK_TaskAssignments_User FOREIGN KEY (beekeeper_id) REFERENCES Users(id)
);