'use client'
import { Button, Input, Checkbox, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,Avatar } from "@nextui-org/react";import styles from "./StaffPage.module.scss";
import { useState } from "react";
import clsx from "clsx";
const StaffPage = () => {
    const ITEMS_PER_PAGE = 10;
    const allStaffData = Array(22).fill({
        id: "#101",
        name: "Watson Joyce",
        email: "watsonjoycell12@gmail.com",
        phone: "+1 (123) 123 4654",
        age: "45 yr",
        salary: "$2200.00",
        timings: "9am to 6pm",
    })
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
  const totalPages = Math.ceil(allStaffData.length / ITEMS_PER_PAGE);
  
  const displayedStaff = allStaffData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
    return ( 
      <div className={clsx(styles.container, "p-6  text-white min-h-screen")}> 
      <h1 className="text-2xl font-semibold mb-4">Staff ({allStaffData.length})</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Button className="bg-pink-400 text-black font-semibold">Staff Management</Button>
          <Button variant="bordered" className="text-white">Attendance</Button>
        </div>
        <div className="flex gap-4">
          <Button className="bg-pink-500 text-white rounded-lg px-4 py-2" onClick={() => setIsModalOpen(true)}>Add Staff</Button>
          <Dropdown>
            <DropdownTrigger>
              <Button className="bg-gray-700 text-white flex items-center px-4 py-2 rounded-lg">
                Sort by 
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="name">Name</DropdownItem>
              <DropdownItem key="age">Age</DropdownItem>
              <DropdownItem key="salary">Salary</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-800 text-gray-400">
              <th className="p-3"><Checkbox /></th>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Age</th>
              <th className="p-3">Salary</th>
              <th className="p-3">Timings</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedStaff.map((staff, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="p-3"><Checkbox /></td>
                <td className="p-3">{staff.id}</td>
                <td className="p-3">{staff.name}<br/><span className="text-pink-400 text-sm">Manager</span></td>
                <td className="p-3">{staff.email}</td>
                <td className="p-3">{staff.phone}</td>
                <td className="p-3">{staff.age}</td>
                <td className="p-3">{staff.salary}</td>
                <td className="p-3">{staff.timings}</td>
                <td className="p-3 flex gap-3">
                  <div>View</div>
                  <div>Edit</div>
                  <div>Delete</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          Previous
        </Button>
        <span className="px-4 py-2 bg-gray-800 rounded">Page {currentPage} of {totalPages}</span>
        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </Button>
      </div>

      {/* Add Staff Modal */}
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent className="bg-gray-900 text-white rounded-lg">
          <ModalHeader className="text-xl font-semibold">Add Staff</ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center gap-4">
              <Avatar size="lg" className="bg-gray-700" />
              <Button className="text-pink-400">Change Profile Picture</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="Enter full name" />
              <Input label="Email" placeholder="Enter email address" />
              <Input label="Role" placeholder="Select role" />
              <Input label="Phone number" placeholder="Enter phone number" />
              <Input label="Salary" placeholder="Enter Salary" />
              <Input label="Date of birth" placeholder="Enter date of birth" type="date" />
              <Input label="Shift start timing" placeholder="Enter start timing" type="time" />
              <Input label="Shift end timing" placeholder="Enter end timing" type="time" />
              
            </div>
              <Input label="Address" placeholder="Enter address" className="col-span-2" />
              <Input label="Additional details" placeholder="Enter additional details" className="col-span-2" />
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(false)} variant="bordered">Cancel</Button>
            <Button className="bg-pink-500 text-white">Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
     );
}
 
export default StaffPage;