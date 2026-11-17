// 사진에서 대상만 남긴 PNG(배경 투명, 원본과 같은 크기)를 만든다. 앱이 기기에서 하는 배경 제거와 같은 Vision 요청이다.
// 쓰는 법: swift tools/cutout.swift <사진> <결과.png>
import AppKit
import CoreImage
import Vision

let args = CommandLine.arguments
guard args.count == 3, let image = NSImage(contentsOfFile: args[1]),
      let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("usage: cutout.swift <photo> <out.png>"); exit(1)
}
let handler = VNImageRequestHandler(cgImage: cg)
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let subject = request.results?.first else { print("no subject found"); exit(2) }
let masked = try subject.generateMaskedImage(ofInstances: subject.allInstances, from: handler, croppedToInstancesExtent: false)
try CIContext().writePNGRepresentation(of: CIImage(cvPixelBuffer: masked), to: URL(fileURLWithPath: args[2]),
                                       format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("wrote", args[2])
