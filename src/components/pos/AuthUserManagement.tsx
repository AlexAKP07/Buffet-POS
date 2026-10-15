import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  ArrowRightLeft, 
  UserCheck, 
  RefreshCw,
  Eye,
  EyeOff,
  Building,
  Sparkles,
  Camera,
  Upload
} from 'lucide-react';
import { User, UserRole, Branch, Language } from '../../types';

interface AuthUserManagementProps {
  users: User[];
  branches: Branch[];
  currentUser: User;
  language: Language;
  onSwitchUser: (user: User) => void;
  onCreateUser: (newUser: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  onMoveUserBranch: (userId: string, newBranchId: string) => void;
  onChangeUserRole: (userId: string, newRole: UserRole) => void;
  onUpdateUserAvatar?: (userId: string, newAvatar: string) => void;
}

export const AuthUserManagement: React.FC<AuthUserManagementProps> = ({
  users,
  branches,
  currentUser,
  language,
  onSwitchUser,
  onCreateUser,
  onMoveUserBranch,
  onChangeUserRole,
  onUpdateUserAvatar,
}) => {
  const isLao = language === 'la';

  // Sub-tabs: User List / RBAC, Login Simulator, Forgot Password Flow
  const [activeTab, setActiveTab] = useState<'users' | 'login_sim' | 'forgot_password'>('users');

  // Create User Form State
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('+856 20 ');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('SERVICE_WAITER');
  const [newBranchId, setNewBranchId] = useState<string>(branches[0]?.id || 'BR-VTE-01');

  // Password validation helper
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;

  // Login Simulator State
  const [loginIdentifier, setLoginIdentifier] = useState<string>('mrsoukphac@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('P@ssword2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  // Forgot Password Flow State
  const [forgotContact, setForgotContact] = useState<string>('+856 20 5555 8899');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      alert(isLao ? 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ, 1 ຕົວໃຫຍ່, 1 ຕົວເລກ, ແລະ 1 ອັກຂະລະພິເສດ' : 'Password must meet all security constraints (8+ chars, 1 uppercase, 1 number, 1 special char)');
      return;
    }

    onCreateUser({
      username: newUsername,
      fullName: newFullName,
      email: newEmail,
      phone: newPhone,
      role: newRole,
      branchId: newBranchId,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isActive: true
    });

    setCreateModalOpen(false);
    alert(isLao ? 'ສ້າງຜູ້ໃຊ້ໃໝ່ສຳເລັດ!' : 'User created successfully!');
  };

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => 
      u.email.toLowerCase() === loginIdentifier.toLowerCase() || 
      u.username.toLowerCase() === loginIdentifier.toLowerCase() || 
      u.phone === loginIdentifier
    );

    if (found) {
      onSwitchUser(found);
      setLoginSuccessMessage(isLao ? `ເຂົ້າສູ່ລະບົບສຳເລັດ! ຍິນດີຕ້ອນຮັບ ${found.fullName} (${found.role})` : `Login successful! Welcome ${found.fullName}`);
      setTimeout(() => setLoginSuccessMessage(null), 3500);
    } else {
      alert(isLao ? 'ບໍ່ພົບຜູ້ໃຊ້ນີ້ໃນລະບົບ' : 'User identifier not found');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Header & Sub-Tabs */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isLao ? 'ການຈັດການຜູ້ໃຊ້, ສິດການເຂົ້າເຖິງ (RBAC) & ຄວາມປອດໄພ' : 'User Identity, RBAC & Security Management'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isLao ? 'ກວດສອບຄວາມປອດໄພລະຫັດຜ່ານ, ຍ້າຍສາຂາ, ກຳນົດບົດບາດ ແລະ ຈຳລອງການ Login' : 'Password security enforcement, branch reassignment, role authorization & auth simulator'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-600">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'users' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            {isLao ? 'ລາຍຊື່ຜູ້ໃຊ້ (Users List)' : 'User Management'}
          </button>
          <button
            onClick={() => setActiveTab('login_sim')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'login_sim' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            {isLao ? 'ຈຳລອງ Login (Auth Simulator)' : 'Login Simulator'}
          </button>
          <button
            onClick={() => setActiveTab('forgot_password')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'forgot_password' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            {isLao ? 'ລືມລະຫັດຜ່ານ (SMS/OTP)' : 'Forgot Password'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS LIST & ROLE / BRANCH MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isLao ? `ພະນັກງານທັງໝົດ (${users.length} ທ່ານ)` : `All System Users (${users.length})`}
            </h3>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLao ? 'ເພີ່ມຜູ້ໃຊ້ໃໝ່ (Create User)' : 'Add New User'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => {
              const branch = branches.find(b => b.id === user.branchId);
              const isCurrent = user.id === currentUser.id;

              return (
                <div
                  key={user.id}
                  className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border transition shadow-sm ${
                    isCurrent ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative group shrink-0">
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/60 shadow-md ring-2 ring-amber-500/20"
                          referrerPolicy="no-referrer"
                        />
                        {onUpdateUserAvatar && (
                          <>
                            <label
                              htmlFor={`avatar-input-${user.id}`}
                              className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] text-white font-bold cursor-pointer transition"
                              title={isLao ? 'ຄລິກເພື່ອປ່ຽນຮູບໂປຣໄຟລ໌' : 'Click to change photo'}
                            >
                              <Camera className="w-4 h-4 text-amber-400 mb-0.5" />
                              <span>{isLao ? 'ປ່ຽນຮູບ' : 'Edit'}</span>
                            </label>
                            <input
                              id={`avatar-input-${user.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const result = event.target?.result as string;
                                    if (result) {
                                      onUpdateUserAvatar(user.id, result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900 dark:text-white truncate max-w-[180px]">
                          {user.fullName}
                        </div>
                        <div className="text-[11px] text-amber-500 font-mono font-bold">@{user.username}</div>
                        <div className="text-[10px] text-emerald-500 font-bold mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{isLao ? 'ເຈົ້າຂອງລະບົບ (System Owner)' : 'System Owner'}</span>
                        </div>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-sm">
                        {isLao ? 'ທ່ານ (YOU)' : 'YOU'}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">{isLao ? 'ບົດບາດ (Role):' : 'Role:'}</span>
                      <select
                        value={user.role}
                        onChange={(e) => onChangeUserRole(user.id, e.target.value as UserRole)}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
                        <option value="CASHIER">CASHIER</option>
                        <option value="KITCHEN_CHEF">KITCHEN_CHEF</option>
                        <option value="SERVICE_WAITER">SERVICE_WAITER</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">{isLao ? 'ສາຂາ (Branch):' : 'Branch:'}</span>
                      <select
                        value={user.branchId}
                        onChange={(e) => onMoveUserBranch(user.id, e.target.value)}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 max-w-[150px] truncate"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.nameEn.split(':')[1]?.trim() || b.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{user.email}</span>
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                      onClick={() => onSwitchUser(user)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isLao ? 'ສະຫຼັບເປັນຜູ້ໃຊ້ນີ້' : 'Switch to this User'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUTH / LOGIN SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'login_sim' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {isLao ? 'ເຂົ້າສູ່ລະບົບ POS (Multi-Identifier Login)' : 'Multi-Identifier Enterprise Login'}
            </h3>
            <p className="text-xs text-slate-400">
              {isLao ? 'ຮອງຮັບ: ຊື່ຜູ້ໃຊ້, ເບີໂທ (+856), ຫຼື Email' : 'Supports Username, Lao Phone (+856) or Email'}
            </p>
          </div>

          {loginSuccessMessage && (
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{loginSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleSimulateLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isLao ? 'ບັນຊີຜູ້ໃຊ້ / ເບີໂທ / Email:' : 'Username / Phone / Email:'}
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="mrsoukphac@gmail.com or +856 20 5555 8899"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isLao ? 'ລະຫັດຜ່ານ (Password):' : 'Password:'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>{isLao ? 'ຈື່ຂ້ອຍໄວ້ (Remember Me)' : 'Remember Me'}</span>
              </label>

              <button
                type="button"
                onClick={() => setActiveTab('forgot_password')}
                className="text-amber-600 hover:underline font-semibold text-xs"
              >
                {isLao ? 'ລືມລະຫັດຜ່ານ?' : 'Forgot Password?'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md shadow-amber-500/20 transition"
            >
              {isLao ? 'ເຂົ້າສູ່ລະບົບ (Sign In)' : 'Sign In'}
            </button>

            {/* Social Auth Simulation */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-center space-y-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {isLao ? 'ຫຼື ເຂົ້າສູ່ລະບົບຜ່ານ Social Auth' : 'Or Sign In with Social Auth'}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert(isLao ? 'ຈຳລອງ Google OAuth 2.0 Identity Flow ສຳເລັດ!' : 'Google OAuth flow simulated!')}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => alert(isLao ? 'ຈຳລອງ Facebook Login Flow ສຳເລັດ!' : 'Facebook Auth simulated!')}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Facebook
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FORGOT PASSWORD FLOW (SMS / OTP) */}
      {/* ========================================================================= */}
      {activeTab === 'forgot_password' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {isLao ? 'ກູ້ຄືນລະຫັດຜ່ານຜ່ານ SMS / Email' : 'Self-Service Password Recovery'}
            </h3>
            <p className="text-xs text-slate-400">
              {isLao ? 'ລະບົບຈະສົ່ງລະຫັດ OTP 6 ຫຼັກໄປຫາເບີໂທ ຫຼື Email' : 'System sends 6-digit OTP to your verified phone/email'}
            </p>
          </div>

          {!otpSent ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isLao ? 'ເບີໂທລະສັບ ຫຼື Email ທີ່ລົງທະບຽນ:' : 'Registered Phone or Email:'}
                </label>
                <input
                  type="text"
                  value={forgotContact}
                  onChange={(e) => setForgotContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={() => setOtpSent(true)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs"
              >
                {isLao ? 'ສົ່ງລະຫັດ OTP (Send OTP)' : 'Send OTP Code'}
              </button>
            </div>
          ) : !resetSuccess ? (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-300 text-xs text-amber-800 dark:text-amber-300">
                {isLao ? `ລະຫັດ OTP ຖືກສົ່ງໄປຫາ ${forgotContact} ແລ້ວ (ລະຫັດທົດສອບ: 889922)` : `OTP sent to ${forgotContact} (Mock code: 889922)`}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isLao ? 'ໃສ່ລະຫັດ OTP 6 ຫຼັກ:' : 'Enter 6-Digit OTP:'}
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="889922"
                  className="w-full px-3.5 py-2.5 rounded-xl text-center font-mono text-base tracking-widest font-black border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={() => setResetSuccess(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
              >
                {isLao ? 'ຢືນຢັນ & ຕັ້ງລະຫັດຜ່ານໃໝ່' : 'Verify & Reset Password'}
              </button>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {isLao ? 'ກູ້ຄືນລະຫັດຜ່ານສຳເລັດ!' : 'Password reset link confirmed!'}
              </h4>
              <button
                onClick={() => {
                  setOtpSent(false);
                  setResetSuccess(false);
                  setActiveTab('login_sim');
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
              >
                {isLao ? 'ກັບໄປໜ້າ Login' : 'Back to Login'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE USER WITH PASSWORD SECURITY VALIDATION */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              {isLao ? 'ສ້າງບັນຊີຜູ້ໃຊ້ໃໝ່ (Create User)' : 'Create New User Profile'}
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isLao ? 'ຊື່ຜູ້ໃຊ້ (Username):' : 'Username:'}
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                    placeholder="e.g. somphone.k"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isLao ? 'ຊື່ເຕັມ (Full Name):' : 'Full Name:'}
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                    placeholder="ທ່ານ ສົມພອນ ແກ້ວສຸວັນ"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email:
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    placeholder="somphone@laobuffet.la"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isLao ? 'ເບີໂທລະສັບ (+856):' : 'Phone (+856):'}
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Password & Security Constraints Checklist */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isLao ? 'ລະຫັດຜ່ານ (Password - ຕ້ອງຜ່ານເງື່ອນໄຂຄວາມປອດໄພ):' : 'Password (Security Checklist):'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="e.g. Buffet#2026Secure"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />

                {/* 4 Security rules indicators */}
                <div className="grid grid-cols-2 gap-1.5 mt-2 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl text-[10px]">
                  <div className={`flex items-center gap-1 font-semibold ${hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>8+ ຕົວອັກສອນ (Min 8 chars)</span>
                  </div>
                  <div className={`flex items-center gap-1 font-semibold ${hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>1 ຕົວໃຫຍ່ (1 Uppercase A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1 font-semibold ${hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>1 ຕົວເລກ (1 Number 0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1 font-semibold ${hasSpecialChar ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>1 ອັກຂະລະພິເສດ (!@#$%)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isLao ? 'ບົດບາດ (Role):' : 'Role:'}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="KITCHEN_CHEF">KITCHEN_CHEF</option>
                    <option value="SERVICE_WAITER">SERVICE_WAITER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isLao ? 'ສາຂາ (Branch):' : 'Branch:'}
                  </label>
                  <select
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  {isLao ? 'ຍົກເລີກ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!isPasswordValid}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 disabled:opacity-40"
                >
                  {isLao ? 'ຢືນຢັນສ້າງຜູ້ໃຊ້' : 'Confirm Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
