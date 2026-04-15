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

    public DashboardAdminDTO getAdminDashboard() {
        List<User> employees = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());

        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long pendingTasks = taskRepository.countByStatus(TaskStatus.PENDING);
        long inReviewTasks = taskRepository.countByStatus(TaskStatus.IN_REVIEW);

        List<DashboardAdminDTO.EmployeeProgressDTO> progress = employees.stream()
                .map(emp -> {
                    long empTotal = taskRepository.countByAssignedToIdAndStatus(emp.getId(), TaskStatus.PENDING)
                            + taskRepository.countByAssignedToIdAndStatus(emp.getId(), TaskStatus.IN_REVIEW)
                            + taskRepository.countByAssignedToIdAndStatus(emp.getId(), TaskStatus.COMPLETED)
                            + taskRepository.countByAssignedToIdAndStatus(emp.getId(), TaskStatus.REJECTED);
                    return DashboardAdminDTO.EmployeeProgressDTO.builder()
                            .userId(emp.getId())
                            .name(emp.getName())
                            .email(emp.getEmail())
                            .profilePicture(emp.getProfilePicture())
                            .totalTasks(empTotal)
                            .completedTasks(taskRepository.countByAssignedToIdAndStatus(emp.getId(), TaskStatus.COMPLETED))
                            .pendingDocuments(documentRepository.countByUserIdAndStatus(emp.getId(), DocumentStatus.PENDING))
                            .submittedDocuments(documentRepository.countByUserIdAndStatus(emp.getId(), DocumentStatus.SUBMITTED))
                            .approvedDocuments(documentRepository.countByUserIdAndStatus(emp.getId(), DocumentStatus.APPROVED))
                            .rejectedDocuments(documentRepository.countByUserIdAndStatus(emp.getId(), DocumentStatus.REJECTED))
                            .build();
                })
                .collect(Collectors.toList());

        return DashboardAdminDTO.builder()
                .totalEmployees(employees.size())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks + inReviewTasks)
                .employeeProgress(progress)
                .build();
    }

    public DashboardEmployeeDTO getEmployeeDashboard(User user) {
        Long userId = user.getId();

        long completedTasks = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.COMPLETED);
        long pendingTasks = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.PENDING);
        long inReviewTasks = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.IN_REVIEW);
        long pendingDocs = documentRepository.countByUserIdAndStatus(userId, DocumentStatus.PENDING);
        long submittedDocs = documentRepository.countByUserIdAndStatus(userId, DocumentStatus.SUBMITTED);
        long approvedDocs = documentRepository.countByUserIdAndStatus(userId, DocumentStatus.APPROVED);
        long rejectedDocs = documentRepository.countByUserIdAndStatus(userId, DocumentStatus.REJECTED);

        LocalDate now = LocalDate.now();
        LocalDate nextWeek = now.plusDays(7);
        List<TaskDTO> upcomingDeadlines = taskRepository
                .findByAssignedToIdAndStatusAndDeadlineBetween(userId, TaskStatus.PENDING, now, nextWeek)
                .stream()
                .map(taskService::toDTO)
                .collect(Collectors.toList());

        return DashboardEmployeeDTO.builder()
                .totalTasks(completedTasks + pendingTasks + inReviewTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks + inReviewTasks)
                .pendingDocuments(pendingDocs)
                .submittedDocuments(submittedDocs)
                .approvedDocuments(approvedDocs)
                .rejectedDocuments(rejectedDocs)
                .upcomingDeadlines(upcomingDeadlines)
                .build();
    }
}
