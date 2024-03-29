import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Select,
	Steps,
	Result,
} from "antd";
import {
	PlusOutlined,
	BankOutlined,
	FileDoneOutlined,
	SolutionOutlined,
	PaperClipOutlined,
	LoadingOutlined,
	CheckOutlined,
} from "@ant-design/icons";
import { FC, useState, useContext, useEffect } from "react";
import { SuperUserContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import SelectBuilding from "./SelectBuilding";
import AddContract from "./AddContract";
import AddAttachments from "./AddAttachments";
const { Step } = Steps;

type steps =
	| "buildingStep"
	| "contractStep"
	| "attachmentsStep"
	| "completedStep";

interface props {
	fetchData: Function;
}

interface CollectionCreateFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	confirmLoading,
	onCreate,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(SuperUserContext);
	const [page, setPage] = useState("selectBuilding");
	const [buildingNames, setBuildingNames] = useState([]);
	const [occupancies, setOccupancies] = useState([]);
	const [hazardClassification, setHazardClassification] = useState([]);
	const [typeOfConstruction, setTypeOfConstruction] = useState([]);
	const [engineers, setEngineers] = useState([]);
	const [contractType, setContractType] = useState([]);
	const [requiredFields, setRequiredFields] = useState({
		building_name: true,
		region: true,
		time_zone: true,
		jurisdiction: true,
		building_no: true,
		street_no: true,
		zone_no: true,
		// unit_no: true,
		building_area: true,
		occupancy_classification: true,
		hazard_classification: true,
		building_completion_certificate_number: true,
		contact_number: true,
		building_height: true,
		type_of_construction: true,
		owner: true,
		contract_number: true,
		contract_type: true,
	});
	const [buildingsRequiredFields, setBuildingsRequiredFields] = useState({
		building_name: true,
		jurisdiction: true,
		building_no: true,
		street_no: true,
		zone_no: true,
		// unit_no: true,
		building_area: true,
		occupancy_classification: true,
		hazard_classification: true,
		building_completion_certificate_number: true,
		contact_number: true,
		building_height: true,
		type_of_construction: true,
	});

	const [buildingDetails, setBuildingDetails] = useState<any>({});
	const [contractDetails, setContractDetails] = useState({});
	const [attachmentDetails, setAttachmentDetails] = useState({});

	const [addingBuilding, setAddingBuilding] = useState(-1);
	const [savingContract, setSavingContract] = useState(-1);
	const [savingAttachments, setSavingAttachments] = useState(-1);

	const [systems, setSystems] = useState<Array<{ id: number; name: string }>>(
		[]
	);

	const [BuildingForm] = Form.useForm();

	useEffect(() => {
		getAllDropdowns();
		getAllBuildings();
		getSystems();
	}, []);

	const getAllDropdowns = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/dropdownAll",
			handleResponse: (res) => {
				setOccupancies(res.data.message.occupancyClassification || []);
				setHazardClassification(res.data.message.hazardClassification || []);
				setTypeOfConstruction(res.data.message.typeOfConstruction || []);
				setContractType(res.data.message.contractType || []);
				setEngineers(res.data.message.engineers || []);
				setRequiredFields(
					res.data.message.add_building_required_fields
						.add_building_required_fields
				);
				// props.setRequiredFields(
				// 	res.data.message.add_building_required_fields
				// 		.add_building_required_fields
				// );
			},
		});
	};

	const getAllBuildings = () => {
		apiCall({
			method: "GET",
			url: "/buildings?column_name=names",
			handleResponse: (res) => {
				setBuildingNames(res.data.message || []);
			},
		});
	};

	const getStepStatus = (step: steps) => {
		if (step === "buildingStep") {
			switch (page) {
				case "selectBuilding":
				case "addBuilding":
					return "process";
				case "contract":
				case "attachments":
				case "completed":
					return "finish";
			}
		} else if (step === "contractStep") {
			switch (page) {
				case "selectBuilding":
				case "addBuilding":
					return "wait";
				case "contract":
					return "process";
				case "attachments":
				case "completed":
					return "finish";
			}
		} else if (step === "attachmentsStep") {
			switch (page) {
				case "selectBuilding":
				case "addBuilding":
				case "contract":
					return "wait";
				case "attachments":
					return "process";
				case "completed":
					return "finish";
			}
		} else if (step === "completedStep") {
			switch (page) {
				case "selectBuilding":
				case "addBuilding":
				case "contract":
				case "attachments":
					return "wait";
				case "completed":
					return "finish";
			}
		}
		return "wait";
	};

	const getSystems = () => {
		apiCall({
			method: "GET",
			url: "/assets/systems",
			handleResponse: (res) => {
				setSystems(res.data.message);
			},
		});
	};

	const saveContractDetails = (building_id: any) => {
		setSavingContract(0);
		apiCall({
			method: "POST",
			url: "/contracts",
			data: { contract: { ...contractDetails, building_id } },
			handleResponse: (res) => {
				console.log(res);
				setSavingContract(1);
			},
			handleError: (err) => {
				setSavingContract(-1);
			},
		});
	};

	const addBuilding = () => {
		if (buildingDetails) setAddingBuilding(0);
		apiCall({
			method: "POST",
			url: "/buildings",
			data: { building: buildingDetails },
			handleResponse: (res) => {
				console.log(res);
				setAddingBuilding(1);
				saveContractDetails(res.data.message.id);
			},
			handleError: (err) => {
				setAddingBuilding(-1);
			},
		});
	};

	const submit = () => {
		if (buildingDetails.id) {
			saveContractDetails(buildingDetails.id);
		} else {
			addBuilding();
		}
	};

	const closeModal = () => {
		form.resetFields();
		onCancel();
		setPage("selectBuilding");
		setSavingAttachments(-1);
		setSavingContract(-1);
		setAddingBuilding(-1);
	};

	return (
		<Modal
			visible={visible}
			destroyOnClose={true}
			footer={null}
			style={{ top: "15px" }}
			bodyStyle={{ overflowY: "scroll", maxHeight: "calc(100vh - 150px)" }}
			title={
				<>
					<h3 style={{ marginTop: "2px" }}>Create Contract</h3>

					<Steps size="small">
						<Step
							status={getStepStatus("buildingStep")}
							title="Building"
							icon={<BankOutlined />}
						/>
						<Step
							status={getStepStatus("contractStep")}
							title="Contract"
							icon={<SolutionOutlined />}
						/>
						<Step
							status={getStepStatus("attachmentsStep")}
							title="Attachments"
							icon={<PaperClipOutlined />}
						/>
						<Step
							status={getStepStatus("completedStep")}
							title="Completed"
							icon={<FileDoneOutlined />}
						/>
					</Steps>
				</>
			}
			okText="Add Client"
			cancelText="Cancel"
			onCancel={closeModal}
			onOk={() => {
				form
					.validateFields()
					.then((values) => {
						onCreate(values).then(() => {
							form.resetFields();
						});
					})
					.catch((info) => {
						console.log("Validate Failed:", info);
					});
			}}
			confirmLoading={confirmLoading}
			width={1000}
		>
			{page === "selectBuilding" ? (
				<SelectBuilding
					nextFunc={() => setPage("contract")}
					occupancies={occupancies}
					hazardClassification={hazardClassification}
					typeOfConstruction={typeOfConstruction}
					requiredFields={buildingsRequiredFields}
					setBuildingDetails={setBuildingDetails}
					buildingNames={buildingNames}
					engineers={engineers}
					// form={BuildingForm}
				/>
			) : page === "addBuilding" ? (
				<div>HEllo</div>
			) : page === "contract" ? (
				<AddContract
					nextFunc={() => {
						setPage("attachments");
					}}
					contractType={contractType}
					setContractDetails={setContractDetails}
					systems={systems}
				/>
			) : // <Button onClick={() => setPage("attachments")}>Next</Button>
			page === "attachments" ? (
				// <Button onClick={() => setPage("completed")}>Next</Button>
				<AddAttachments
					nextFunc={() => {
						setPage("completed");
						console.log("buildingDetails: ", buildingDetails);
						console.log("AttachmentDetails: ", attachmentDetails);
						console.log("ContractDetails: ", contractDetails);
						submit();
					}}
					setAttachmentDetails={setAttachmentDetails}
				/>
			) : (
				// <>
				// 	{addingBuilding === 1 ? (
				// 		<h4 style={{ color: "green" }}>
				// 			<CheckOutlined />
				// 			&nbsp;Building Successfully added
				// 		</h4>
				// 	) : addingBuilding === 0 ? (
				// 		<h4 style={{ color: "#0087FF" }}>
				// 			<LoadingOutlined />
				// 			&nbsp; Adding Building
				// 		</h4>
				// 	) : null}
				// 	{savingContract === 1 ? (
				// 		<h4 style={{ color: "green" }}>
				// 			<CheckOutlined />
				// 			&nbsp; Contract details saved
				// 		</h4>
				// 	) : savingContract === 0 ? (
				// 		<h4 style={{ color: "#0087FF" }}>
				// 			<LoadingOutlined />
				// 			&nbsp; Saving Contract Details
				// 		</h4>
				// 	) : null}
				// </>
				<Result
					// status={savingContract === 1 ? "success" : undefined}
					status={"success"}
					icon={savingContract === 1 ? undefined : <LoadingOutlined />}
					title={
						savingContract === 1
							? "Contract Successfully Added"
							: "Adding a New Contract"
					}
					subTitle={
						addingBuilding === 0
							? "Adding Building"
							: savingContract === 0
							? "Saving Contract Details"
							: ""
					}
					extra={[
						savingContract === 1 ? (
							<Button type="primary" onClick={closeModal} key="console">
								Go Back
							</Button>
						) : (
							""
						),
					]}
				/>
			)}
		</Modal>
	);
};

const AddNewBuilding: FC<props> = ({ fetchData }) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/clients",
				data: { client: values },
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
					message.success(res.data.message);
					setVisible(false);
					fetchData();
				},
				handleError: (err) => {
					reject(err);
					setConfirmLoading(false);
				},
			});
		});
	};

	return (
		<div>
			<Button
				icon={<PlusOutlined />}
				onClick={() => {
					setVisible(true);
				}}
				type={"primary"}
			>
				Create Contract
			</Button>
			<CollectionCreateForm
				visible={visible}
				onCreate={onCreate}
				onCancel={() => {
					setVisible(false);
				}}
				confirmLoading={confirmLoading}
			/>
		</div>
	);
};

export default AddNewBuilding;
