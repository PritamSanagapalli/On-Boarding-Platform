package com.onboarding.service;

import com.onboarding.dto.TaskCreateRequest;
import com.onboarding.dto.TaskDTO;
import com.onboarding.exception.ResourceNotFoundException;
import com.onboarding.exception.UnauthorizedException;
import com.onboarding.model.Task;
import com.onboarding.model.User;
import com.onboarding.model.enums.Role;
import com.onboarding.model.enums.TaskPriority;
import com.onboarding.model.enums.TaskStatus;
import com.onboarding.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for task management operations.
 * Enforces role-based access: Admins can CRUD all tasks, Employees can only update status.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserService userService;

    public TaskService(TaskRepository taskRepository, UserService userService) {
        this.taskRepository = taskRepository;
        this.userService = userService;
    }

    /**
     * Create a new task (Admin only).
     */
    public TaskDTO createTask(TaskCreateRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can create tasks");
        }

        User assignedTo = userService.getUserEntityById(request.getAssignedToId());

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ?
                        TaskStatus.valueOf(request.getStatus()) : TaskStatus.PENDING)
                .priority(request.getPriority() != null ?
                        TaskPriority.valueOf(request.getPriority()) : TaskPriority.MEDIUM)
                .deadline(request.getDeadline())
                .assignedTo(assignedTo)
                .createdBy(currentUser)
                .build();

        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    /**
     * Get all tasks with optional filters (Admin).
     */
    public Page<TaskDTO> getAllTasks(TaskStatus status, TaskPriority priority,
                                     LocalDate deadline, String search, Pageable pageable) {
        return taskRepository.findWithFilters(status, priority, deadline, search, pageable)
                .map(this::toDTO);
    }

    /**
     * Get tasks for a specific user with optional filters.
     */
    public Page<TaskDTO> getTasksByUser(Long userId, TaskStatus status, TaskPriority priority,
                                         LocalDate deadline, String search, Pageable pageable) {
        return taskRepository.findByUserWithFilters(userId, status, priority, deadline, search, pageable)
                .map(this::toDTO);
    }

    /**
     * Get a single task by ID.
     */
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        return toDTO(task);
    }

    /**
     * Update a task.
     * Admins can update everything; Employees can only update status.
     */
    public TaskDTO updateTask(Long id, TaskCreateRequest request, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        if (currentUser.getRole() == Role.ADMIN) {
            // Admin can update all fields
            task.setTitle(request.getTitle());
            task.setDescription(request.getDescription());
            if (request.getStatus() != null) {
                task.setStatus(TaskStatus.valueOf(request.getStatus()));
            }
            if (request.getPriority() != null) {
                task.setPriority(TaskPriority.valueOf(request.getPriority()));
            }
            task.setDeadline(request.getDeadline());
            if (request.getAssignedToId() != null) {
                User assignedTo = userService.getUserEntityById(request.getAssignedToId());
                task.setAssignedTo(assignedTo);
            }
        } else if (currentUser.getRole() == Role.EMPLOYEE) {
            // Employee can only update status of their own tasks
            if (!task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only update your own tasks");
            }
            if (request.getStatus() != null) {
                task.setStatus(TaskStatus.valueOf(request.getStatus()));
            }
        }

        Task updated = taskRepository.save(task);
        return toDTO(updated);
    }

    /**
     * Delete a task (Admin only).
     */
    public void deleteTask(Long id, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can delete tasks");
        }
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task", id);
        }
        taskRepository.deleteById(id);
    }

    /**
     * Convert Task entity to DTO.
     */
    public TaskDTO toDTO(Task task) {
        return TaskDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .priority(task.getPriority().name())
                .deadline(task.getDeadline())
                .assignedTo(userService.toDTO(task.getAssignedTo()))
                .createdBy(userService.toDTO(task.getCreatedBy()))
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
