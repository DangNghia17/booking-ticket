/* eslint-disable react-hooks/exhaustive-deps */
import { Input, Radio, Space, Spin } from "antd";
import { filter } from "lodash";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useFindAllAccount,
  useFindAllCustomer,
} from "../api/services/adminServices";
import { useFetchAllOrganizers } from "../api/services/organizationServices";
import { Header } from "../components";
import Table from "../components/Table";
import { accountColumns, pendingAccountsColumns } from "../data/dummy";
import { AccountStatus } from "../utils/constants";
import ExportExcelButton from "../components/common/excel-button";
import { getCurrentDatetime } from "../utils/utils";
import { BsPersonFill, BsSearch, BsFilterLeft, BsXLg } from "react-icons/bs";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import Highlighter from "react-highlight-words";

const { Group } = Radio;
const Accounts = () => {
  const toolbarOptions = ["Search"];
  const { data: organizers, status } = useFetchAllOrganizers();
  const { data: accounts, status: accountStatus } = useFindAllAccount();
  const { data: customers, status: customerStatus } = useFindAllCustomer();
  const { t } = useTranslation();
  const [value, setValue] = useState("all");
  const onChange = (e) => {
    setValue(e.target.value);
  };
  const accountData = accounts?.map((item) => ({
    key: item.id,
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    loginTime: item.loginTime,
    role: item.role,
  }));
  const pendingAccountData = filter(organizers, {
    organization: { status: AccountStatus.disabled },
  }).map((item) => ({
    key: item.organization.email,
    name: item.name,
    email: item.organization.email,
    province: item.organization.province,
    status: item.organization.status,
  }));
  // for table
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        className="p-4 bg-white rounded-lg shadow-lg border border-gray-200 w-72 
                   divide-y divide-gray-100"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="pb-4">
          <div className="relative">
            <Input
              ref={searchInput}
              placeholder={`Tìm kiếm ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                         focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600
                       rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <BsSearch className="text-sm" />
            Tìm kiếm
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => clearFilters && handleReset(clearFilters)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg
                         transition-colors text-sm font-medium border border-gray-200"
            >
              Reset
            </button>

            <button
              onClick={() => {
                close();
              }}
              className="p-2 text-gray-400 hover:text-gray-600
                         rounded-lg hover:bg-gray-50 transition-colors
                         border border-gray-200"
            >
              <BsXLg className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    ),
    filterIcon: (filtered) => (
      <BsSearch 
        className={`text-base ${filtered ? "text-blue-500" : "text-gray-400"}
                   hover:text-gray-500 transition-colors`}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  // end for table
  const nameColumn = accountColumns.find((e) => e.dataIndex === "name");
  Object.assign(nameColumn, getColumnSearchProps("name"));
  // export excel

  const columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Name", key: "name", width: 32 },
    { header: "Email", key: "email", width: 32 },
    { header: "Phone", key: "phone", width: 20 },
    { header: "Role", key: "role", width: 32 },
  ];
  const data = accountData?.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    role: item.role,
  }));
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-500/80 uppercase tracking-wider mb-2">
          {t("sider.management")}
        </p>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                       bg-clip-text text-transparent">
          {t("sider.account")}
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setValue('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                         ${value === 'all' 
                           ? 'bg-blue-50 text-blue-600' 
                           : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t("account.all")}
            </button>
            <button
              onClick={() => setValue('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                         ${value === 'pending' 
                           ? 'bg-blue-50 text-blue-600' 
                           : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t("account.pending-accounts")}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <ExportExcelButton
              data={data}
              columns={columns}
              filename={`Account-${getCurrentDatetime()}`}
            />
          </div>
        </div>

        {status === "loading" ? (
          <div className="w-full h-[400px] flex items-center justify-center">
            <Spin />
          </div>
        ) : (
          <div className="overflow-hidden">
            <Table
              columns={value === "all" ? accountColumns : pendingAccountsColumns}
              dataSource={value === "all" ? accountData : pendingAccountData}
              rowKey={value === "all" ? "id" : "email"}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default Accounts;
