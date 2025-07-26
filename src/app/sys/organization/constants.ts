export const OrganizationConstants = {
  CreatedSuccess: "添加组织成功！",
  CreatedFail: "添加组织失败！",
  UpdatedSuccess: "修改组织成功！",
  UpdatedFail: "修改组织失败！",
  DeletedSuccess: "删除组织成功！",
  DeletedFail: "删除组织失败！",

  ErrorNotExist: "组织不存在！",
  ErrorPidNotExist: "父级组织不存在！",
  ErrorNameRepeat: "组织名称重复，请重新输入！",
  ErrorCodeRepeat: "组织编码重复，请重新输入！",
  ErrorExistChildren: "此组织下有子组织，请删除其所有子组织后再操作！",
  ErrorExistStaff: "该组织或其子组织下有员工，无法删除！",
  ErrorExistPosition: "该组织或其子组织下有岗位，无法删除！",
  ErrorPidCantEqSelfAndChildId:
    "父节点不能为自己和其子节点，请重新选择父节点！",
  ErrorMustInParentIds: "该组织的父节点只能在其原有上级组织链下选择！",
};
