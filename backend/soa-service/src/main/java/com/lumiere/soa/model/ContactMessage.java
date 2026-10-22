package com.lumiere.soa.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessage {

    @Id
    private String id;

    @Builder.Default
    @JsonProperty("table_type")
    private String tableType = "contact_message";

    private String name;

    private String email;

    private String phone;

    private String subject;

    @Column(length = 4000)
    private String message;

    @JsonProperty("is_read")
    @Builder.Default
    private boolean isRead = false;

    @JsonProperty("reply_message")
    private String replyMessage;

    @Builder.Default
    private boolean replied = false;

    @JsonProperty("replied_at")
    private String repliedAt;

    @JsonProperty("created_at")
    private String createdAt;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = "msg_" + System.currentTimeMillis();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now().toString();
        }
    }

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }

    @JsonProperty("createdAt")
    public String getCreatedAtAlias() {
        return createdAt;
    }

    @JsonProperty("createdAt")
    public void setCreatedAtAlias(String val) {
        if (this.createdAt == null) {
            this.createdAt = val;
        }
    }

    @JsonProperty("status")
    public String getStatus() {
        return isRead ? "read" : "unread";
    }

    @JsonProperty("status")
    public void setStatus(String status) {
        this.isRead = "read".equalsIgnoreCase(status);
    }

    @JsonProperty("isRead")
    public boolean getIsReadCamel() {
        return isRead;
    }

    @JsonProperty("isRead")
    public void setIsReadCamel(boolean read) {
        this.isRead = read;
    }

    @JsonProperty("read")
    public boolean getReadAlias() {
        return isRead;
    }

    @JsonProperty("read")
    public void setReadAlias(boolean read) {
        this.isRead = read;
    }

    @JsonProperty("replyMessage")
    public String getReplyMessageCamel() {
        return replyMessage;
    }

    @JsonProperty("replyMessage")
    public void setReplyMessageCamel(String replyMessage) {
        this.replyMessage = replyMessage;
        this.replied = (replyMessage != null && !replyMessage.isBlank());
        if (this.replied && this.repliedAt == null) {
            this.repliedAt = LocalDateTime.now().toString();
        }
    }

    @JsonProperty("repliedAt")
    public String getRepliedAtCamel() {
        return repliedAt;
    }
}
