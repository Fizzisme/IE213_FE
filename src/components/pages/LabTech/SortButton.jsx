// src/components/pages/LabTech/SortButton.jsx

import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu.js';

import { ArrowUpDown } from '@/components/animate-ui/icons/arrow-up-down.js';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.js';
import { RadioGroupItem } from '@/components/animate-ui/components/radix/radio-group.tsx';
import { RadioGroup } from 'radix-ui';
import { BE_URL } from '@/lib/constans.ts';

/**
 * Component SortButton
 * Cung cấp giao diện menu thả xuống (Dropdown) để người dùng thay đổi thứ tự hiển thị của dữ liệu.
 * Tương tác trực tiếp với bộ lọc và hàm fetch dữ liệu ở component cha.
 * * @param {Object} filters - Đối tượng chứa trạng thái lọc và sắp xếp hiện tại.
 * @param {Function} setFilters - Hàm cập nhật state filters ở component cha.
 * @param {Function} fetchDataFilter - Hàm thực hiện gọi API lấy dữ liệu mới dựa trên bộ lọc đã cập nhật.
 * @param {string} side - Hướng hiển thị của menu content (top, bottom, left, right).
 * @param {number} sideOffset - Khoảng cách lề giữa menu và nút trigger.
 * @param {string} align - Cách căn lề của menu content (start, center, end).
 * @param {number} alignOffset - Khoảng cách căn chỉnh bổ sung.
 */
export default function SortButton({
    filters,
    setFilters,
    fetchDataFilter,
    side = 'top' | 'bottom' | 'left' | 'right',
    sideOffset,
    align = 'start' | 'center' | 'end',
    alignOffset,
}) {
    // Quản lý trạng thái lựa chọn nội bộ (UI) cho Radio Group
    const [position, setPosition] = useState('new');

    return (
        <DropdownMenu>
            {/* Nút bấm kích hoạt menu, sử dụng asChild để gán sự kiện cho component AnimateIcon */}
            <DropdownMenuTrigger asChild>
                <AnimateIcon
                    animateOnHover
                    className="flex gap-1.5 border-2 p-1.5 rounded-lg items-center cursor-pointer shadow-xs transition-all duration-300 hover:shadow-sm hover:scale-[1.01] group"
                >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="font-semibold text-sm group-hover:scale-[1.01] transition-all duration-300 select-none">
                        Sắp xếp
                    </span>
                </AnimateIcon>
            </DropdownMenuTrigger>

            {/* Phần nội dung của Dropdown Menu */}
            <DropdownMenuContent
                className="w-56"
                align={align}
                alignOffset={alignOffset}
                side={side}
                sideOffset={sideOffset}
            >
                <DropdownMenuLabel className="text-sm font-bold">Sắp xếp</DropdownMenuLabel>

                {/* Đường kẻ phân cách nội dung */}
                <DropdownMenuSeparator style={{ height: '2px' }} />

                <DropdownMenuLabel className="text-sm text-gray-400 font-medium">Ngày tạo</DropdownMenuLabel>

                {/* Nhóm các lựa chọn Radio để thay đổi tiêu chí sắp xếp */}
                <DropdownMenuRadioGroup
                    value={position}
                    onValueChange={async (value) => {
                        // Chuyển đổi giá trị UI ('new'/'old') sang tham số sort của hệ thống ('desc'/'asc')
                        const sort = value === 'new' ? 'desc' : 'asc';

                        // Nếu giá trị sắp xếp mới trùng với giá trị hiện tại thì không thực hiện lại thao tác
                        if (sort === filters.sort) return;

                        // Cập nhật trạng thái hiển thị của Radio Item
                        setPosition(value);

                        // Tạo đối tượng filter mới đã cập nhật trường sort
                        const updated = { ...filters, sort };

                        // Cập nhật state ở component cha để đồng bộ hóa dữ liệu
                        setFilters(updated);

                        // Kích hoạt hàm fetch dữ liệu để cập nhật danh sách hiển thị
                        fetchDataFilter(updated);
                    }}
                >
                    {/* Các lựa chọn sắp xếp cụ thể */}
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="new">
                        Mới nhất
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="old">
                        Cũ nhất
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
