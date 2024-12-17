import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { FiSearch, FiCloud, FiFilter, FiTrash } from "react-icons/fi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileWarning } from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardImage,
  CardSubTitle,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { motion, AnimatePresence } from "framer-motion";
import Typography from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { RenderFile } from "../preview/RenderFile";
import { useMappedJobs } from "@/hooks/useMyJobs";
import CircularProgress from "../Progress/CircularProgress";

interface ImageSelectProps {
  onChange: (hcsUrl: string) => void;
  formData?: string | null;
  introMessage: string;
  warningMessage: string;
  network: string;
  messageEnabled: boolean;
  uploadMessage?: string;
}

export const ImageSelect = ({
  onChange,
  formData,
  introMessage,
  warningMessage,
  network = "testnet",
  messageEnabled = true,
}: ImageSelectProps) => {
  const filteredJobs = useMappedJobs(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [mimeType, setMimeType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [standardFilter, setStandardFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const itemsPerPage = 20;

  const [manualTopicId, setManualTopicId] = useState("");

  const handleSelectOpen = () => setSelectOpen(true);
  const handleSelectClose = () => setSelectOpen(false);

  const handlePageChange = (increment: number) => {
    setCurrentPage((prevPage) => prevPage + increment);
  };

  const handleManualTopicIdSubmit = () => {
    if (manualTopicId) {
      onChange(`${manualTopicId}`);
      setManualTopicId("");
      handleSelectClose();
    }
  };

  const filteredAndPaginatedJobs = useMemo(() => {
    const filtered = filteredJobs?.filter((job) => {
      const nameMatch = job.name
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase());
      const typeMatch = typeFilter !== "all" ? job.type === typeFilter : true;
      const standardMatch =
        standardFilter !== "all"
          ? job.fileStandard?.toString() === standardFilter?.toString()
          : true;
      const dateMatch =
        startDate && endDate
          ? new Date(job.createdAt) >= startDate &&
            new Date(job.createdAt) <= endDate
          : true;
      return nameMatch && typeMatch && standardMatch && dateMatch;
    });
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [
    filteredJobs,
    searchQuery,
    currentPage,
    typeFilter,
    standardFilter,
    startDate,
    endDate,
  ]);

  const selectedFileUrl = `https://kiloscribe.com/api/inscription-cdn/${formData?.replace(
    "hcs://1/",
    ""
  )}?network=${network}`;

  return (
    <>
      <Typography>
        {introMessage ||
          'Each file must be inscribed separately. If the file you want to add does not exist yet, click the "Inscribe New File" button, and then when your inscription is ready, click "Select File" to add it to your metadata.'}
      </Typography>
      <div className="flex mt-2">
        <Button
          id="select-file-button"
          onClick={handleSelectOpen}
          className="mr-2"
        >
          <FiSearch className="mr-2" />
          Select File
        </Button>
        <Button
          onClick={() => {
            window.open(
              "https://kiloscribe.com/inscribe?network=testnet",
              "_blank"
            );
          }}
        >
          <FiCloud className="mr-2" />
          Inscribe New File
        </Button>
      </div>
      {!formData && messageEnabled && (
        <div className="mt-2">
          <Alert variant="destructive" icon={<FileWarning />}>
            <AlertTitle>No File Selected Yet.</AlertTitle>
            <AlertDescription>
              {warningMessage ||
                "If you do not select the file, it will not show up in the secondary files."}
            </AlertDescription>
          </Alert>
        </div>
      )}
      {formData && (
        <Card className="mt-4 max-w-96">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Selected File</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => onChange("")}>
                <FiTrash className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardImage>
            <RenderFile
              mimeType={
                formData === "hcs://1/0.0.7345804" ? "image/png" : mimeType
              }
              url={
                selectedFileUrl.startsWith("https://")
                  ? selectedFileUrl
                  : `https://kiloscribe.com/api/inscription-cdn/${selectedFileUrl}?network=${network}`
              }
              className="max-w-full max-h-full object-contain"
              height={200}
            />
          </CardImage>
          <CardContent>
            <CardDescription>
              Topic: {formData?.replace("hcs://1/", "")}
            </CardDescription>
          </CardContent>
        </Card>
      )}
      <Modal
        isOpen={selectOpen}
        handleClose={handleSelectClose}
        modalTitle="Select File"
        isFullScreen
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-grow">
              <Input
                placeholder="Enter Topic ID manually"
                value={manualTopicId}
                onChange={(e) => setManualTopicId(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleManualTopicIdSubmit}
              className="whitespace-nowrap"
            >
              Use Topic ID
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
            <div className="w-full sm:flex-grow">
              <Input
                placeholder="Search inscriptions..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value.replace("hcs://1/", ""))
                }
                className="w-full"
                icon={<FiSearch className="text-gray-400 ml-2" size={20} />}
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="whitespace-nowrap"
            >
              <FiFilter className="mr-2" size={16} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="hashinal">Hashinal</SelectItem>
                      <SelectItem value="hashinal-collection">
                        Hashinal Collection
                      </SelectItem>
                      <SelectItem value="upload">Upload</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={standardFilter}
                    onValueChange={setStandardFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All standards</SelectItem>
                      <SelectItem value="1">Immutable (1)</SelectItem>
                      <SelectItem value="6">Mutable (6)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <DatePicker date={startDate} setDate={setStartDate} />
                    <span>to</span>
                    <DatePicker date={endDate} setDate={setEndDate} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
            {!filteredAndPaginatedJobs && selectOpen && <CircularProgress />}
            {filteredAndPaginatedJobs.map((version) => (
              <div key={`${version.topic}-${version.created}`}>
                <Card
                  className="card cursor-pointer w-full mb-4"
                  onClick={() => {
                    onChange(`${version.imageTopicId}`);
                    setMimeType(version.mimeType || "image/png");
                    handleSelectClose();
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-sm mb-2 truncate">
                      {version.name}
                    </CardTitle>
                    {Boolean(version.created) && (
                      <CardSubTitle>
                        {format(version.created, "MM/dd/yyyy HH:mm:ss")}
                      </CardSubTitle>
                    )}
                  </CardHeader>
                  <CardImage>
                    <RenderFile
                      className="max-w-full max-h-full object-contain"
                      mimeType={version.mimeType}
                      url={`https://kiloscribe.com/api/inscription-cdn/${version.imageTopicId}?network=${version.network}`}
                    />
                  </CardImage>
                  <CardContent className="p-4">
                    <CardDescription>
                      <Typography className="mb-1">
                        Type: {version.type}
                      </Typography>
                      <Typography className="mb-1">
                        Standard: {version.fileStandard}
                      </Typography>
                      <Typography className="mb-1">
                        File Type: {version.mimeType}
                      </Typography>
                      <Typography className="mb-1">
                        Created:{" "}
                        {new Date(version.created).toLocaleDateString()}
                      </Typography>
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4 mt-4">
            <Button
              onClick={() => handlePageChange(-1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(1)}
              disabled={currentPage * itemsPerPage >= filteredJobs.length}
            >
              Next
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
