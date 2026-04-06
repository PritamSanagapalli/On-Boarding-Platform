package com.onboarding.controller;

import com.onboarding.dto.ApiResponse;
import com.onboarding.dto.TaskCreateRequest;
import com.onboarding.dto.TaskDTO;
import com.onboarding.model.User;
import com.onboarding.model.enums.TaskPriority;
import com.onboarding.model.enums.TaskStatus;
import com.onboarding.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Controller for task management endpoints.
 * Supports CRUD operations, filtering, search, and pagination.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * POST /api/tasks
     * Create a new task (Admin only).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TaskDTO>> createTask(
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        TaskDTO task = taskService.createTask(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", task));
    }

    /**
     * GET /api/tasks
     * List all tasks with optional filters and pagination.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TaskDTO>>> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) LocalDate deadline,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        TaskStatus taskStatus = status != null ? TaskStatus.valueOf(status) : null;
        TaskPriority taskPriority = priority != null ? TaskPriority.valueOf(priority) : null;

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TaskDTO> tasks = taskService.getAllTasks(taskStatus, taskPriority, deadline, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    /**
     * GET /api/tasks/user/{userId}
     * Get tasks assigned to a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<TaskDTO>>> getTasksByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) LocalDate deadline,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        TaskStatus taskStatus = status != null ? TaskStatus.valueOf(status) : null;
        TaskPriority taskPriority = priority != null ? TaskPriority.valueOf(priority) : null;

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TaskDTO> tasks = taskService.getTasksByUser(userId, taskStatus, taskPriority,
                deadline, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    /**
     * GET /api/tasks/{id}
     * Get a single task by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDTO>> getTaskById(@PathVariable Long id) {
        TaskDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    /**
     * PUT /api/tasks/{id}
     * Update a task.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal User currentUser) {
        TaskDTO task = taskService.updateTask(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", task));
    }

    /**
     * DELETE /api/tasks/{id}
     * Delete a task (Admin only).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        taskService.deleteTask(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}
