package com.onboarding.service;

import com.onboarding.dto.DashboardAdminDTO;
import com.onboarding.dto.DashboardEmployeeDTO;
import com.onboarding.dto.TaskDTO;
import com.onboarding.model.Task;
import com.onboarding.model.User;
import com.onboarding.model.enums.DocumentStatus;
import com.onboarding.model.enums.Role;
import com.onboarding.model.enums.TaskStatus;
import com.onboarding.repository.DocumentRepository;
import com.onboarding.repository.TaskRepository;
import com.onboarding.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for dashboard statistics and analytics.
 */
@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final DocumentRepository documentRepository;
    private final TaskService taskService;

    public DashboardService(UserRepository userRepository,
                            TaskRepository taskRepository,
                            DocumentRepository documentRepository,
                            TaskService taskService) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.documentRepository = documentRepository;
        this.taskService = taskService;
    }

    /**
     * Get admin dashboard statistics.
     * Includes total counts and per-employee progress.
     */
    public DashboardAdminDTO getAdminDashboard() {
        List<User> employees = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());

        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long pendingTasks = taskRepository.countByStatus(TaskStatus.PENDING);

        List<DashboardAdminDTO.EmployeeProgressDTO> progress = employees.stream()
                .map(emp -> DashboardAdminDTO.EmployeeProgressDTO.builder()
                        .userId(emp.getId())
                        .name(emp.getName())
                        .email(emp.getEmail())
                        .profilePicture(emp.getProfilePicture())
                        .totalTasks(taskRepository.countByAssignedToIdAndStatus(emp.getId(), TaskStatus.PENDING)
                                + taskRepository.countByAssignedToIdAndStatus(emp.getId(), TaskStatus.COMPLETED))
                        .completedTasks(taskRepository.countByAssignedToIdAndStatus(emp.getId(), TaskStatus.COMPLETED))
                        .pendingDocuments(documentRepository.countByUserIdAndStatus(emp.getId(), DocumentStatus.PENDING))
                        .submittedDocuments(documentRepository.countByUserIdAndStatus(emp.getId(), DocumentStatus.SUBMITTED))
                        .build())
                .collect(Collectors.toList());

        return DashboardAdminDTO.builder()
                .totalEmployees(employees.size())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .employeeProgress(progress)
                .build();
    }

    /**
     * Get employee dashboard statistics.
     * Includes task counts and upcoming deadlines.
     */
    public DashboardEmployeeDTO getEmployeeDashboard(User user) {
        Long userId = user.getId();

        long completedTasks = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.COMPLETED);
        long pendingTasks = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.PENDING);
        long pendingDocs = documentRepository.countByUserIdAndStatus(userId, DocumentStatus.PENDING);
        long submittedDocs = documentRepository.countByUserIdAndStatus(userId, DocumentStatus.SUBMITTED);

        // Get tasks with deadlines in the next 7 days
        LocalDate now = LocalDate.now();
        LocalDate nextWeek = now.plusDays(7);
        List<TaskDTO> upcomingDeadlines = taskRepository
                .findByAssignedToIdAndStatusAndDeadlineBetween(userId, TaskStatus.PENDING, now, nextWeek)
                .stream()
                .map(taskService::toDTO)
                .collect(Collectors.toList());

        return DashboardEmployeeDTO.builder()
                .totalTasks(completedTasks + pendingTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .pendingDocuments(pendingDocs)
                .submittedDocuments(submittedDocs)
                .upcomingDeadlines(upcomingDeadlines)
                .build();
    }
}
