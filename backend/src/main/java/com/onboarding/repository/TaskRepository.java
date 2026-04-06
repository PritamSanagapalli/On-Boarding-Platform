package com.onboarding.repository;

import com.onboarding.model.Task;
import com.onboarding.model.enums.TaskPriority;
import com.onboarding.model.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Task entity operations with filtering and search support.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find tasks assigned to a specific user
    List<Task> findByAssignedToId(Long userId);

    Page<Task> findByAssignedToId(Long userId, Pageable pageable);

    // Count tasks by status for a user
    long countByAssignedToIdAndStatus(Long userId, TaskStatus status);

    // Count all tasks by status
    long countByStatus(TaskStatus status);

    // Filter tasks with optional criteria
    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:deadline IS NULL OR t.deadline <= :deadline) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> findWithFilters(
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            @Param("deadline") LocalDate deadline,
            @Param("search") String search,
            Pageable pageable);

    // Filter tasks for a specific user
    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:deadline IS NULL OR t.deadline <= :deadline) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> findByUserWithFilters(
            @Param("userId") Long userId,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            @Param("deadline") LocalDate deadline,
            @Param("search") String search,
            Pageable pageable);

    // Find upcoming deadlines for a user
    List<Task> findByAssignedToIdAndStatusAndDeadlineBetween(
            Long userId, TaskStatus status, LocalDate start, LocalDate end);
}
