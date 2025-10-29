import { User } from "@/interfaces";
import { SearchOutlined } from "@ant-design/icons";
import { Empty, Select, Skeleton, Spin, theme } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { userService } from "@/services";
import debounce from "lodash/debounce";
import { UserOptionItem } from "./UserOptionItem";

interface UserSearchSelectorProps {
    onSelect?: (user: User | null) => void;
    style?: React.CSSProperties;
}

interface UserValue {
    label: string;
    value: number;
    user: User;
}

const fetchUsers = async (search: string): Promise<UserValue[]> => {
    try {
        search = search.trim();
        if (search === "") return [];
        const response = await userService.searchPos({
            searchName: search,
            size: 10,
            page: 1,
        });
        const users = response.data || [];
        return users.map((user: User) => ({
            label: `${user.first_name} ${user.last_name} (${user.phone_number})`,
            value: user.id,
            user,
        }));
    } catch (err) {
        console.error("ERROR:", err);
        return [];
    }
};

export const UserSearchSelector = ({
    onSelect,
    style,
}: UserSearchSelectorProps) => {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<UserValue[]>([]);
    const [mounted, setMounted] = useState(false);
    const searchTextRef = useRef<string>("");
    const isEmptyRef = useRef<boolean>(false);
    const fetchRef = useRef(0);

    const debounceFetcher = useMemo(() => {
        const loadOptions = async (searchValue: string) => {
            searchTextRef.current = searchValue.trim();
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);

            const newOptions = await fetchUsers(searchValue);
            if (fetchId !== fetchRef.current) {
                return;
            }
            setOptions(newOptions);
            isEmptyRef.current = newOptions.length === 0 && searchTextRef.current !== "";
            setFetching(false);
        };
        return debounce(loadOptions, 300);
    }, []);

    const handleChange = (newValue: UserValue, option: any) => {

        // Gọi callback onSelect
        if (onSelect) {
            onSelect(option ? option.user : null);
        }
        // Reset trạng thái
        searchTextRef.current = ""; // Xóa văn bản tìm kiếm
        setOptions([]); // Xóa danh sách options
        isEmptyRef.current = false; // Đặt lại trạng thái isEmpty
        setFetching(false); // Đặt lại trạng thái fetching
    };

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 150);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) {
        return <Skeleton.Input active block style={{ height: "32px", ...style }} />;
    }

    return (
        <Select
            showSearch
            labelInValue
            value={null}
            placeholder="Search by phone number..."
            style={style}
            filterOption={false}
            onSearch={(val) => {
                searchTextRef.current = val;
                if (val.trim() === "") {
                    setOptions([]);
                    isEmptyRef.current = false;
                    setFetching(false);
                    return;
                }
                debounceFetcher(val);
            }}
            onChange={handleChange}
            notFoundContent={
                fetching ? (
                    <Spin style={{ margin: "8px auto", display: "block" }} size="small" />
                ) : searchTextRef.current.trim() && !fetching && isEmptyRef.current ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Not Found" />
                ) : null
            }
            suffixIcon={<SearchOutlined />}
            options={options.map((option) => ({
                label: option.label,
                value: option.value,
                user: option.user,
            }))}

            optionRender={(option) => (
                <UserOptionItem
                    label={String(option.label)}
                    user={option.data.user}
                />
            )}

        />
    );
};