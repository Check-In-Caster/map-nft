import { getUploadUrl } from "@/app/maps/actions";
import axios from "axios";
import { Image } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";

interface ImageUploadProps {
  label: string;
  path: string;
  selected_file?: string | null;
  handleUploadFile: (file: string) => void;
  onSelectFile?: (file: string) => void;
  is_details_hidden?: boolean;
  multimedia?: boolean;
  accept_any_files?: boolean;
}

const ImageUpload = (props: ImageUploadProps) => {
  const [imageFile, setImageFile] = useState("");

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  console.log(acceptedFiles);

  const [loading, setLoading] = useState(0);
  const {
    label,
    is_details_hidden,
    multimedia,
    handleUploadFile,
    accept_any_files = false,
    onSelectFile,
    ...restProps
  } = props;

  async function storeFileUsingWebStorage() {
    const selectedFile = acceptedFiles[0];

    setLoading(10);
    const fileType = selectedFile.type.split("/")[1];
    const newName = `${uuidv4()}.${fileType}`;

    console.log({
      name: `${props.path}/${newName}`,
      type: selectedFile.type,
    });

    const data = await getUploadUrl({
      name: `${props.path}/${newName}`,
      type: selectedFile.type,
    });

    setLoading(25);

    const url = data;

    const renamedFile = new File([selectedFile], newName, {
      type: selectedFile.type,
    });

    await axios.put(url, renamedFile, {
      headers: {
        "Content-type": selectedFile.type,
        "Access-Control-Allow-Origin": "*",
      },
    });

    const filePath =
      process.env.NEXT_PUBLIC_BUCKET_URL + `${props.path}/${newName}`;

    setLoading(75);

    setImageFile(filePath);

    if (props.handleUploadFile) {
      await props.handleUploadFile(filePath);
    }

    setLoading(100);
  }

  useEffect(() => {
    if (acceptedFiles[0]) {
      if (props.onSelectFile) {
        props.onSelectFile(acceptedFiles[0].name);
      }
      storeFileUsingWebStorage();
    }
  }, [acceptedFiles]);

  const files = acceptedFiles.map((file) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));

  return (
    <div>
      {imageFile ? (
        <div>
          <img
            width={160}
            height={160}
            className="w-[160px] h-[160px] mt-2 rounded-md"
            src={`${imageFile}`}
            alt=""
          />

          <a
            className="inline-block mb-1 bg-gray-100 border rounded-md px-3 py-1.5 mt-5"
            onClick={() => {
              props.handleUploadFile("");
              setImageFile("");
              setLoading(0);
            }}
          >
            Change Image
          </a>
        </div>
      ) : (
        <>
          <div
            {...getRootProps({ className: "dropzone" })}
            className="bg-[#E0EBFE] rounded-md p-20 w-min"
          >
            <input {...getInputProps()} />
            <Image className="w-14 h-14 text-[#fff]" />
          </div>
          <aside>
            <ul>{files}</ul>
          </aside>
        </>
      )}
    </div>
  );
};

export default ImageUpload;
