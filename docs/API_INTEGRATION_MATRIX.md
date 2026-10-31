# SIMS API Integration Matrix

| Module | Feature | FastAPI Endpoint | HTTP Method | Request Schema | Response Schema | Integration Status | Notes / Action Needed |
|---|---|---|---|---|---|---|---|
| **Auth** | User Login | `/api/v1/auth/login` | POST | `LoginRequest` (email, password) | `APIResponse[TokenResponse]` | Connected | Returns user, token, status |
| **Auth** | User Registration | `/api/v1/auth/register` | POST | `UserRegisterRequest` | `APIResponse[UserResponse]` | Connected | Creates account in PENDING status |
| **Auth** | Google OAuth | `/api/v1/auth/google` | POST | `GoogleAuthRequest` | `APIResponse[TokenResponse]` | Connected | First time user creates PENDING |
| **Auth** | Current Profile | `/api/v1/auth/me` | GET | None | `APIResponse[UserResponse]` | Connected | Returns profile |
| **Auth** | Check Status | `/api/v1/auth/status` | GET | None | `APIResponse[dict]` | Connected | Returns approval status & permissions |
| **Auth** | User Logout | `/api/v1/auth/logout` | POST | None | `APIResponse[None]` | Connected | Terminates session |
| **Admin** | List Users | `/api/v1/users` | GET | Query (page, size, role, account_status) | `PaginatedResponse[UserResponse]` | Connected Backend / UI Missing | `RolesPermissionsPage` currently calls mock storage |
| **Admin** | Approve User | `/api/v1/users/{id}/approve` | POST | `UserApprovalRequest` (role, permissions) | `APIResponse[UserResponse]` | Connected Backend / UI Missing | Needs connection in `RolesPermissionsPage` |
| **Admin** | Reject User | `/api/v1/users/{id}/reject` | POST | `UserRejectionRequest` (reason) | `APIResponse[UserResponse]` | Connected Backend / UI Missing | Needs connection in `RolesPermissionsPage` |
| **Admin** | Suspend User | `/api/v1/users/{id}/suspend` | POST | `UserSuspensionRequest` (reason) | `APIResponse[UserResponse]` | Connected Backend / UI Missing | Needs connection in `RolesPermissionsPage` |
| **Admin** | Reactivate User | `/api/v1/users/{id}/reactivate` | POST | None | `APIResponse[UserResponse]` | Connected Backend / UI Missing | Needs connection in `RolesPermissionsPage` |
| **Admin** | Dashboard KPIs | `/api/v1/dashboard/admin` | GET | None | `APIResponse[AdminDashboardResponse]` | Connected | Returns executive KPIs |
| **Sales** | List Enquiries | `/api/v1/sales/enquiries` | GET | Query (lead_status, capacity) | `PaginatedResponse[EnquiryResponse]` | Connected | Fully active |
| **Sales** | Schedule Survey | `/api/v1/sales/surveys` | POST | `SurveyScheduleCreate` | `APIResponse[SurveyResponse]` | Connected | Assigns field technician |
| **Sales** | Generate Quotation | `/api/v1/sales/quotations` | POST | `QuotationCreate` | `APIResponse[QuotationResponse]` | Connected | Requires approved survey |
| **Sales** | Convert Order | `/api/v1/sales/quotations/{id}/accept` | POST | `{ convertToOrder: true }` | `APIResponse[QuotationResponse]` | Connected | Generates Order |
| **Warehouse** | Warehouse KPIs | `/api/v1/dashboard/warehouse` | GET | None | `APIResponse[WarehouseDashboardResponse]` | Connected | Stock, dispatches, alerts |
| **Warehouse** | Inventory Stock | `/api/v1/inventory` | GET | None | `APIResponse[List[InventoryResponse]]` | Connected | Real inventory counts |
| **Warehouse** | Add / Adjust Stock | `/api/v1/inventory/add-stock` | POST | `StockAdjustRequest` | `APIResponse[InventoryResponse]` | Connected | Real inventory mutations |
| **Warehouse** | Dispatches | `/api/v1/dispatches` | GET | Query (status) | `APIResponse[List[DispatchResponse]]` | Connected | Real dispatch list |
| **Technician** | Technician KPIs | `/api/v1/dashboard/technician` | GET | None | `APIResponse[TechnicianDashboardResponse]` | Partially Connected | Currently returns 6 of 15 required KPIs |
| **Technician** | My Assigned Surveys | `/api/v1/surveys` | GET | Query (status, technician_id) | `PaginatedResponse[SurveyResponse]` | Connected | Auto-filtered by authenticated technician |
| **Technician** | Technical Measurements | `/api/v1/surveys/{id}/measurements` | PUT | `SurveyMeasurementUpdate` | `APIResponse[SurveyResponse]` | Connected | Roof, tilt, cable, shadow analysis |
| **Technician** | Survey Photos | `/api/v1/surveys/{id}/photos` | POST | Multipart (`file`, `caption`) | `APIResponse[SurveyPhotoResponse]` | Connected | Stores file in `uploads/surveys` |
| **Technician** | Submit Survey | `/api/v1/surveys/{id}/submit` | POST | None | `APIResponse[SurveyResponse]` | Connected | Transitions to SUBMITTED |
| **Technician** | Assigned Installations | `/api/v1/installations` | GET | Query (status) | `APIResponse[List[InstallationJobResponse]]` | Connected Backend / DB Empty | Reseed needed to populate jobs |
| **Technician** | Start Installation | `/api/v1/installations/{id}/start` | POST | None | `APIResponse[InstallationJobResponse]` | Connected | Starts timer / marks IN_PROGRESS |
| **Technician** | 9-Point Checklist | `/api/v1/installations/{id}/checklist` | PUT | `ChecklistUpdateRequest` | `APIResponse[ChecklistResponse]` | Connected | Saves checklist states |
| **Technician** | Labor Work Logs | `/api/v1/installations/{id}/work-logs` | POST | `WorkLogCreate` | `APIResponse[WorkLogResponse]` | Connected | Persists technician hours |
| **Technician** | Serial Lookup | `/api/v1/serials/{serial_number}` | GET | None | `APIResponse[ProductSerialResponse]` | Connected | Scans and verifies hardware |
| **Technician** | Customer Sign-off | `/api/v1/installations/{id}/signoff` | POST | Multipart (`signature_file`, `customer_name`, `rating`, `remarks`) | `APIResponse[CustomerSignoffResponse]` | Connected | Stores PNG in `uploads/signatures` |
| **Technician** | Complete Installation | `/api/v1/installations/{id}/complete` | POST | `InstallationCompleteRequest` | `APIResponse[InstallationJobResponse]` | Connected | Requires 100% checklist + signoff |

