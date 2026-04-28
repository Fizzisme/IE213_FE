// src/components/pages/LabTech/FilterButton.jsx

import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu.tsx';
import { AnimateIcon } from '@/components/animate-ui/icons/icon.tsx';
import { SlidersHorizontal } from '@/components/animate-ui/icons/sliders-horizontal.tsx';
import { BE_URL } from '@/lib/constans.ts';

/**
 * Component FilterButton
 * Cung cấp giao diện menu thả xuống (Dropdown) để người dùng lựa chọn các tiêu chí lọc dữ liệu.
 * Tích hợp chặt chẽ với trạng thái (state) lọc của component cha thông qua props.
 * * @param {Object} filters - Đối tượng chứa các giá trị lọc hiện tại.
 * @param {Function} setFilters - Hàm cập nhật đối tượng filters ở component cha.
 * @param {Function} fetchDataFilter - Hàm thực hiện gọi API fetch dữ liệu sau khi filter thay đổi.
 * @param {string} side - Hướng hiển thị của menu (top, bottom, left, right).
 * @param {number} sideOffset - Khoảng cách lề của menu so với nút trigger.
 * @param {string} align - Cách căn lề của menu (start, center, end).
 * @param {number} alignOffset - Khoảng cách căn chỉnh bổ sung.
 */
export default function FilterButton({
    filters,
    setFilters,
    fetchDataFilter,
    side = 'top' | 'bottom' | 'left' | 'right',
    sideOffset,
    align = 'start' | 'center' | 'end',
    alignOffset,
}) {
    // Quản lý trạng thái vị trí (lựa chọn) hiện tại của Radio Group bên trong Dropdown
    const [position, setPosition] = useState('ALL');

    return (
        <DropdownMenu>
            {/* Nút bấm để kích hoạt hiển thị Dropdown Menu */}
            <DropdownMenuTrigger asChild>
                <AnimateIcon
                    animateOnHover
                    className="flex gap-1.5 border-2 p-1.5 rounded-lg items-center cursor-pointer shadow-xs transition-all duration-300 hover:shadow-sm hover:scale-[1.01] group"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="font-semibold text-sm group-hover:scale-[1.01] transition-all duration-300 select-none">
                        Bộ lọc
                    </span>
                </AnimateIcon>
            </DropdownMenuTrigger>

            {/* Nội dung chi tiết của menu thả xuống */}
            <DropdownMenuContent
                className="w-56"
                align={align}
                alignOffset={alignOffset}
                side={side}
                sideOffset={sideOffset}
            >
                <DropdownMenuLabel className="text-sm font-bold">Bộ lọc</DropdownMenuLabel>

                {/* Đường kẻ phân cách giữa các phần của menu */}
                <DropdownMenuSeparator style={{ height: '2px' }} />

                <DropdownMenuLabel className="text-sm text-gray-400 font-medium">Trạng thái</DropdownMenuLabel>

                {/* Nhóm các lựa chọn dạng Radio (chọn duy nhất một giá trị) */}
                <DropdownMenuRadioGroup
                    value={position}
                    onValueChange={async (value) => {
                        // Nếu giá trị chọn mới trùng với giá trị status hiện tại thì không xử lý lại
                        if (value === filters.status) return;

                        // Cập nhật trạng thái hiển thị của Radio Item
                        setPosition(value);

                        // Tạo đối tượng filter mới dựa trên giá trị cũ và status vừa cập nhật
                        const updated = { ...filters, status: value };

                        // Đồng bộ lại state ở component cha
                        setFilters(updated);

                        // Kích hoạt hàm fetch dữ liệu với bộ lọc mới nhất
                        fetchDataFilter(updated);
                    }}
                >
                    {/* Các tùy chọn cụ thể của bộ lọc trạng thái */}
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="ALL">
                        Tất cả
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="CREATED">
                        Chờ Kết quả
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="text-sm font-semibold cursor-pointer" value="HAS_RESULT">
                        Đã có kết quả
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
