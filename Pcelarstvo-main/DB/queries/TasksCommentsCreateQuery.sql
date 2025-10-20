CREATE TABLE dbo.TaskComments (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    task_id         INT          NOT NULL,
    author_id       INT          NOT NULL, 
    assignment_id   INT          NULL,     
    content         VARCHAR(2000) NOT NULL,
    created_at      DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_TaskComments_Task FOREIGN KEY (task_id) REFERENCES Tasks(id),
    CONSTRAINT FK_TaskComments_Author FOREIGN KEY (author_id) REFERENCES Users(id),
    CONSTRAINT FK_TaskComments_Assignment FOREIGN KEY (assignment_id) REFERENCES TaskAssignments(id)
);
