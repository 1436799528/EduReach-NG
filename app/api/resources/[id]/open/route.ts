import {NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Authentication required'},{status:401})

  const {data:resource,error}=await supabase
    .from('resources')
    .select('id,status,external_url,file_url,storage_path')
    .eq('id',id)
    .eq('status','approved')
    .maybeSingle()

  if(error)return NextResponse.json({error:'Unable to load resource'},{status:500})
  if(!resource)return NextResponse.json({error:'Resource not found'},{status:404})

  if(resource.storage_path){
    const {data,error:storageError}=await supabase.storage
      .from('edureach-resources')
      .createSignedUrl(resource.storage_path,300)
    if(storageError||!data?.signedUrl)return NextResponse.json({error:'Resource file unavailable'},{status:404})
    return NextResponse.redirect(data.signedUrl)
  }

  const url=resource.external_url||resource.file_url
  if(!url)return NextResponse.json({error:'Resource location unavailable'},{status:404})
  return NextResponse.redirect(url)
}
